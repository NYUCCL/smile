#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

import inquirer from 'inquirer'
import chalk from 'chalk'
import figlet from 'figlet'
// import shell from 'shelljs'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { dirname, isAbsolute, extname, parse, format } from 'path'
import { Command, Option } from 'commander'
// import appconfig from '../src/config'

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
  const program = new Command();
  program
    .addOption(new Option('-t, --type <type>', 'type of data to download').choices(['testing', 'real']))
    .addOption(new Option('-c, --complete_only <complete_only>', 'complete only or all data').choices(['all', 'complete_only']))
    .option('-b, --branch_name <branch_name>', 'branch name')
    .option('-f, --filename <filename>', 'filename')
    .option('-r', '--save_recruitment_info', 'save recruitment info')

  program.parse();
  const options = program.opts();

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
      default: 'main',
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
      default: 'data',
    },
  ];

  const filteredQuestions = questions.filter((q) => !(q.name.toLowerCase() in options));
  const answers = filteredQuestions.length === 0 ? {} : await inquirer.prompt(filteredQuestions);
  
  return {
    ...answers,
    ...Object.fromEntries(Object.entries(options).map(([k, v]) => [k.toUpperCase(), v])),
  }
}

const storeData = async (data, path, relativeDir = 'data/raw', ext = '.json' ) => {
  try {
    let filename = path;
    if (extname(path) !== ext) {
      filename = `${path}${ext}`
    }

    if (!isAbsolute(filename)) {
      filename = `${relativeDir}/${filename}`
    }
    
    const dir = dirname(filename);
    if (!fs.existsSync(dir)) {
      console.log(`creating directory ${dir} since it does not exist`);
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filename, JSON.stringify(data))
    return filename;
  } catch (err) {
    console.error(err)
  }

  return null;
}

const getData = async (path, completeOnly, filename, saveRecruitmentInfo = false) => {
  const localenv = dotenv.config({ path: 'env/.env.local' })
  const firebaseConfig = {
    apiKey: localenv.parsed.VITE_FIREBASE_APIKEY,
    authDomain: localenv.parsed.VITE_FIREBASE_AUTHDOMAIN,
    projectId: localenv.parsed.VITE_FIREBASE_PROJECTID,
    storageBucket: localenv.parsed.VITE_FIREBASE_STORAGEBUCKET,
    messagingSenderId: localenv.parsed.VITE_FIREBASE_MESSAGINGSENDERID,
    appId: localenv.parsed.VITE_FIREBASE_APPID,
  }
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  let querySnapshot = null

  if (completeOnly === 'all') {
    querySnapshot = await getDocs(collection(db, path))
  } else {
    const q = query(collection(db, path), where('done', '==', true))
    querySnapshot = await getDocs(q)
  }
  const data = []
  querySnapshot.forEach((doc) => {
    const docData = doc.data();
    docData.smile_config.firebaseConfig = {};
    if (!saveRecruitmentInfo) {
      docData.recruitment_info = {};
    }
    data.push({ id: doc.id, data: docData })
  })

  return storeData(data, filename)
}

const success = (filename) => {
  console.log(chalk.green(`your data has been exported to '${filename}'.`))
}

const run = async () => {
  // show script introduction
  init()
  const env = dotenv.config({ path: 'env/.env.git.local' })
  // const project_ref = `${env.parsed.VITE_GIT_OWNER}-${env.parsed.VITE_PROJECT_NAME}-${env.parsed.VITE_GIT_BRANCH_NAME}`

  // ask questions

  const answers = await askQuestions()
  const { TYPE, COMPLETE_ONLY, BRANCH_NAME, FILENAME, SAVE_RECRUITMENT_INFO } = answers

  const projectRef = `${env.parsed.VITE_GIT_OWNER}-${env.parsed.VITE_PROJECT_NAME}-${BRANCH_NAME}`

  // create the file
  const path = `${TYPE}/${projectRef}/data`

  const formatFilename = (f) => {
    const prefix = `${TYPE}-${COMPLETE_ONLY}-${BRANCH_NAME}`;
    if (!f.startsWith(prefix)) {
      return `${prefix}-${f}`;
    }

    return f;
  };

  let filename = FILENAME;
  if (isAbsolute(FILENAME)) {
    const parsedFile = parse(FILENAME);
    parsedFile.base = formatFilename(parsedFile.base);
    filename = format(parsedFile);

  } else {
    filename = formatFilename(filename);

  }
  
  const finalPath = await getData(path, COMPLETE_ONLY, filename, SAVE_RECRUITMENT_INFO)

  // show success message
  success(finalPath);
}

run()
