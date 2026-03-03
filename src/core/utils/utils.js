/**
 * @fileoverview Utility functions for URL parameter handling and recruitment service processing
 * @module utils
 */

/**
 * Import store composables
 * @requires useSmileStore Global store composable for managing application state
 * @requires useLog Logging store composable for application logging
 */
import useSmileStore from '@/core/stores/smilestore'
import useLog from '@/core/stores/log'

/**
 * Gets URL query parameters from the current window location
 * @returns {Object} Dictionary of query parameter key-value pairs
 */
export function getQueryParams() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const queryDict = {}
  for (const [key, value] of urlParams.entries()) {
    queryDict[key] = value
  }
  return queryDict
}

/**
 * Performs service-specific initialization before processing URL parameters.
 * Handles platform quirks (e.g., PANDA's dual-iframe issue) so that user code
 * in design.js doesn't need to know about them.
 * @param {string} service - Recruitment service name
 * @returns {boolean} false if navigation should be cancelled, true otherwise
 */
export function initService(service) {
  const log = useLog()

  if (service === 'panda') {
    // PANDA loads the study in two iframes simultaneously (one hidden for
    // mobile/desktop switching). A hidden iframe reports window.innerWidth === 0,
    // so block it from initializing.
    if (window.innerWidth === 0) {
      log.log('PANDA: hidden iframe detected, cancelling navigation')
      return false
    }
    // Clear existing smilestore localStorage to handle the sibling/retry case
    // where families need to run the study multiple times
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('smilestore')) {
        localStorage.removeItem(key)
      }
    })
  }

  return true
}

/**
 * Processes URL query parameters to determine recruitment service and store participant info
 * @param {Object} query - Query parameters object
 * @param {string} service - Recruitment service name ('prolific', 'cloudresearch', 'mturk', 'citizensci')
 */
export function processQuery(query, service) {
  const smilestore = useSmileStore()
  const urlParams = query
  const log = useLog()

  if (!urlParams) return // do nothing if no query

  if (service === 'prolific' && urlParams.PROLIFIC_PID && urlParams.STUDY_ID && urlParams.SESSION_ID) {
    // this is a prolific experiment
    log.log('Prolific mode')
    smilestore.setRecruitmentService(service, {
      prolific_id: urlParams.PROLIFIC_PID,
      study_id: urlParams.STUDY_ID,
      session_id: urlParams.SESSION_ID,
    })
  } else if (service === 'cloudresearch' && urlParams.assignmentId && urlParams.hitId && urlParams.workerId) {
    log.log('CloudResearch mode')
    smilestore.setRecruitmentService(service, {
      worker_id: urlParams.workerId,
      hit_id: urlParams.hitId,
      assignment_id: urlParams.assignmentId,
    })
  } else if (service === 'mturk' && urlParams.assignmentId && urlParams.hitId && urlParams.workerId) {
    if (urlParams.assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      log.log('AMT mode, but no assignment (preview mode)')
      // supposed to show the ad here
    } else {
      log.log('AMT mode, with assignment')
      smilestore.setRecruitmentService(service, {
        worker_id: urlParams.workerId,
        hit_id: urlParams.hitId,
        assignment_id: urlParams.assignmentId,
      })
    }
  } else if (service === 'sona' && urlParams.survey_code) {
    log.log('Sona mode')
    smilestore.setRecruitmentService(service, {
      survey_code: urlParams.survey_code,
    })
  } else if (service === 'sona_paid' && urlParams.survey_code) {
    log.log('Sona paid mode')
    smilestore.setRecruitmentService(service, {
      survey_code: urlParams.survey_code,
    })
  } else if (service === 'spark' && urlParams.subject_ID) {
    log.log('Spark mode')
    smilestore.setRecruitmentService(service, {
      subject_ID: urlParams.subject_ID,
      participant_ID: urlParams.participant_ID || '',
      age: urlParams.age || '',
      gender: urlParams.gender || '',
    })
  } else if (service === 'panda' && urlParams.ID) {
    log.log('PANDA mode')
    const panda_id = urlParams.ID
    smilestore.setRecruitmentService(service, {
      panda_id,
    })
    smilestore.data.panda_id = panda_id
  } else if (
    service === 'citizensci' &&
    urlParams.CITIZEN_ID &&
    urlParams.CITIZEN_STUDY_ID &&
    urlParams.CITIZEN_SESSION_ID
  ) {
    log.log('Future citizen mode')
    smilestore.setRecruitmentService(service, {
      citizen_id: urlParams.CITIZEN_ID,
      study_id: urlParams.CITIZEN_STUDY_ID,
      session_id: urlParams.CITIZEN_SESSION_ID,
    })
  } else {
    // log.log('const { next, prev } = useTimeline() mode')
  }
}

export default processQuery
