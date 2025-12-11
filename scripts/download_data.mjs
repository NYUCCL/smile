#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

import inquirer from 'inquirer'
import chalk from 'chalk'
import figlet from 'figlet'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { dirname, isAbsolute, extname, parse, format } from 'path'
import { Command, Option } from 'commander'
import { execSync } from 'child_process'

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync('SMILE.', {
        font: 'big',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      })
    )
  )
  console.log(chalk.green('your data is almost here.'))
}

async function askQuestions() {
  const program = new Command()
  program
    .addOption(new Option('-t, --type <type>', 'type of data to download').choices(['testing', 'real']))
    .addOption(
      new Option('-c, --complete_only <complete_only>', 'complete only or all data').choices(['all', 'complete_only'])
    )
    .option('-b, --branch_name <branch_name>', 'branch name')
    .option('-f, --filename <filename>', 'filename')
    .option('-r, --save_recruitment_info', 'save recruitment info')

  program.parse()
  const options = program.opts()
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

  const questions = [
    {
      type: 'list',
      name: 'TYPE',
      message: 'What type of data do you want?',
      choices: ['testing', 'real'],
    },
    {
      type: 'list',
      name: 'COMPLETE_ONLY',
      message: 'Do you want all the data or just that was marked complete?',
      choices: ['all', 'complete_only'],
    },
    {
      type: 'input',
      name: 'BRANCH_NAME',
      message: 'What is the name of the branch you want data from?',
      default: currentBranch,
    },
    {
      type: 'confirm',
      name: 'SAVE_RECRUITMENT_INFO',
      message: 'Should this save the recruitment info (e.g., Prolific IDs)? Defaults to false.',
      default: false,
    },
    {
      type: 'input',
      name: 'FILENAME',
      message: 'What is the name of the file without extension?',
      default: (answers) => {
        const type = answers.TYPE || options.TYPE || 'real'
        const completeOnly = answers.COMPLETE_ONLY || options.COMPLETE_ONLY || 'all'
        const branch = answers.BRANCH_NAME || options.BRANCH_NAME || currentBranch
        return `${type}-${completeOnly}-${branch}-data`
      },
    },
  ]

  const filteredQuestions = questions.filter((q) => !(q.name.toLowerCase() in options))
  const answers = filteredQuestions.length === 0 ? {} : await inquirer.prompt(filteredQuestions)

  return {
    ...answers,
    ...Object.fromEntries(Object.entries(options).map(([k, v]) => [k.toUpperCase(), v])),
  }
}

const storeData = async (data, path, relativeDir = 'data/anonymized', ext = '.json') => {
  try {
    let filename = path
    if (extname(path) !== ext) {
      filename = `${path}${ext}`
    }

    if (!isAbsolute(filename)) {
      filename = `${relativeDir}/${filename}`
    }

    const dir = dirname(filename)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filename, JSON.stringify(data))
    return filename
  } catch (err) {
    console.error(err)
  }

  return null
}

const getData = async (path, completeOnly, db, filename, saveRecruitmentInfo = false) => {
  try {
    let querySnapshot = null

    if (completeOnly === 'all') {
      querySnapshot = await db.collection(path).get()
    } else {
      querySnapshot = await db.collection(path).where('done', '==', true).get()
    }

    const data = []
    for (const doc of querySnapshot.docs) {
      const docData = doc.data()
      if (!docData.smile_config) {
        docData.smile_config = {}
      }
      docData.smile_config.firebaseConfig = {}

      if (saveRecruitmentInfo) {
        const privateData = []
        const privateQuerySnapshot = await db.collection(`${path}/${doc.id}/private`).get()
        for (const privateDoc of privateQuerySnapshot.docs) {
          privateData.push(privateDoc.data())
        }
        docData.private_data = privateData
      }

      data.push({ id: doc.id, data: docData })
    }

    if (saveRecruitmentInfo) {
      return storeData(data, filename, 'data/private')
    } else {
      return storeData(data, filename, 'data/anonymized')
    }
  } catch (error) {
    console.log('The read failed:', error)
  }
}

const success = (filename) => {
  console.log(chalk.green(`your data has been exported to '${filename}'.`))
}

const run = async () => {
  // show script introduction
  init()
  const env = dotenv.config({ path: 'env/.env.git.local' })

  // ask questions
  const answers = await askQuestions()
  const { TYPE, COMPLETE_ONLY, BRANCH_NAME, SAVE_RECRUITMENT_INFO, FILENAME } = answers
  const project_ref = `${env.parsed.VITE_GIT_OWNER}-${env.parsed.VITE_PROJECT_NAME}-${BRANCH_NAME}`

  // connect to database
  const localenv = dotenv.config({ path: 'env/.env.local' })
  const firebaseConfig = {
    apiKey: localenv.parsed.VITE_FIREBASE_APIKEY,
    authDomain: localenv.parsed.VITE_FIREBASE_AUTHDOMAIN,
    projectId: localenv.parsed.VITE_FIREBASE_PROJECTID,
    storageBucket: localenv.parsed.VITE_FIREBASE_STORAGEBUCKET,
    messagingSenderId: localenv.parsed.VITE_FIREBASE_MESSAGINGSENDERID,
    appId: localenv.parsed.VITE_FIREBASE_APPID,
    credential: cert('firebase/.service-account-key.json'),
  }
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // create the file
  const path = `${TYPE}/${project_ref}/data`

  let filename = FILENAME
  if (isAbsolute(FILENAME)) {
    const parsedFile = parse(FILENAME)
    parsedFile.base = parsedFile.base
    filename = format(parsedFile)
  } else {
    filename = filename
  }

  const finalPath = await getData(path, COMPLETE_ONLY, db, filename, SAVE_RECRUITMENT_INFO)

  // show success message
  success(finalPath)
}

run()
