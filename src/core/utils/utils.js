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
