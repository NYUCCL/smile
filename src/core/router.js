/**
 * @fileoverview Router configuration and setup for the SMILE application
 * @module router
 */

/**
 * External dependencies and internal imports for router functionality
 */
import seedrandom from 'seedrandom'
import { createRouter, createWebHashHistory } from 'vue-router'
import { getQueryParams } from '@/core/utils/utils'
import useAPI from '@/core/composables/useAPI'

/**
 * Adds navigation guards to the Vue Router instance to control route access and behavior
 * @param {import('vue-router').Router} r - Vue Router instance to add guards to
 * @param {Object} [providedApi=null] - Optional API instance, will use default if not provided
 */
export function addGuards(r, providedApi = null) {
  /**
   * Navigation guard for route navigation
   * @param {Object} to - The target route object
   * @param {Object} from - The current route object
   * @returns {boolean|Object} - True if navigation is allowed, or a redirect object if navigation is blocked
   */
  r.beforeEach(async (to, from) => {
    const api = providedApi || useAPI()
    if (api.isResetApp()) {
      api.log.warn('ROUTER GUARD: Resetting app')
      api.resetLocalState()
    }

    // check if status change on previous
    if (from.meta !== undefined && from.meta.setConsented !== undefined && from.meta.setConsented) {
      api.store.browserEphemeral.dbConnecting = true
      await api.completeConsent()
      api.store.browserEphemeral.dbConnecting = false
    }

    if (from.meta !== undefined && from.meta.setDone !== undefined && from.meta.setDone) {
      api.setDone()
    }

    if (to.meta !== undefined && to.meta.resetApp !== undefined && to.meta.resetApp) {
      api.resetApp() // set reset app on next load
    }

    if (api.store.config.mode === 'development' && api.store.dev.pinnedRoute) {
      // if pinned route doesn't exist, clear it

      if (!r.hasRoute(api.store.dev.pinnedRoute)) {
        api.store.dev.pinnedRoute = null
      }

      await api.connectDB()
      if (to.name === api.store.dev.pinnedRoute) {
        return true
      } else {
        api.log.error('ROUTER GUARD: Pinned route, redirecting to ' + api.store.dev.pinnedRoute)
        return {
          name: api.store.dev.pinnedRoute,
          replace: true,
        }
      }
    }
    // Set queries to be combination of from queries and to queries
    // (TO overwrites FROM if there is one with the same key)
    // Also add queries that come before the URL -- this later
    // case might not be necessary but was a old problem with
    // prolific.
    const newQueries = {
      ...from.query,
      ...to.query,
      ...getQueryParams(),
    }
    to.query = newQueries

    // log.debug('query params', to.query)
    // log.debug('loading', to.name)
    // log.debug('from', from.name)
    // log.debug('allowAlways', to.meta.allowAlways)

    // on startup set the page to not autofill by default

    // if the database isn't connected and they're a known user, reload their data
    if (api.store.isKnownUser && !api.store.isDBConnected) {
      await api.store.loadData()
    }

    // if withdrew
    // this is leading to infinite redirects.
    // if (api.store.isWithdrawn && !api.store.browserEphemeral.forceNavigate) {
    //   log.debug("withdraw so can't go anywhere")
    //   return {
    //     name: 'withdraw',
    //     replace: true,
    //   }
    // }

    // if you're going to an always-allowed route, allow it
    if (to.meta.allowAlways) {
      api.log.log(`ROUTER GUARD: Requested navigation (${to.name}) is always allowed, so allowing it.`)
      api.store.setLastRoute(to.name)
      api.store.recordRoute(to.name)
      return true
    }

    // if the route requires withdraw and the user has withdrawn
    // then allow it.
    if (to.meta.requiresWithdraw && api.store.isWithdrawn) {
      api.log.warn('ROUTER GUARD: Requested withdraw route and is withdrawn so allowing it')
      api.store.setLastRoute(to.name)
      api.store.recordRoute(to.name)
      return true
    }

    // // If user is withdraw
    if (api.store.isWithdrawn) {
      api.log.warn('ROUTER GUARD: User has withdrawn, redirecting to withdraw page')
      return {
        name: 'withdraw', // this could be lastRoute too
        replace: true,
      }
    }

    // if you're in jumping mode
    // or you're in presentation mode allow the new route
    if (
      (api.store.config.mode === 'development' && api.store.browserEphemeral.forceNavigate) ||
      api.store.config.mode === 'presentation'
    ) {
      api.log.warn(
        'ROUTER GUARD: Allowing direct, out-of-order navigation to /' +
          to.name +
          //to.meta.allowAlways +,
          '.  This is allowed in development/presentation mode but not in production.'
      )
      api.store.setLastRoute(to.name)
      api.store.recordRoute(to.name)
      return true
    }

    // if this is forced
    if (api.store.browserEphemeral.forceNavigate) {
      api.log.warn(
        'ROUTER GUARD: Allowing direct, out-of-order navigation to /' +
          to.name +
          //to.meta.allowAlways +,
          '.  This is being forced by api.goToView().'
      )
      api.store.setLastRoute(to.name)
      api.store.recordRoute(to.name)
      return true
    }

    // if the route requires consent and the user hasn't consented
    if (to.meta.requiresConsent && !api.store.isConsented) {
      api.log.error(
        `ROUTER GUARD: This route (${to.name}) requires consent, but the user has not consented (${api.store.isConsented}).\
         Redirecting to the last route visited. (${api.store.lastRoute})`
      )
      return {
        name: api.store.lastRoute, // this could be lastRoute too
        replace: true,
      }
    }

    if (to.meta.requiresDone && !api.store.isDone) {
      api.log.error(
        `ROUTER GUARD: This route (${to.name}) requires being marked as done, but the user is not done.\
        Redirecting to the last route visited. (${api.store.lastRoute})`
      )
      return {
        name: api.store.lastRoute,
        replace: true,
      }
    }

    // if you're trying to go to the next route
    if (from.meta !== undefined && from.meta.next === to.name && api.store.dev.currentViewDone) {
      api.log.log(
        'ROUTER GUARD: You are trying to go to the next route from ' +
          from.name +
          ' to ' +
          to.name +
          ' and the current page is done so allowing it.'
      )
      api.store.setLastRoute(to.name)
      api.store.recordRoute(to.name)
      return true
    }

    // if you're trying to go to the next route
    if (from.meta !== undefined && from.meta.next === to.name && !api.store.dev.currentViewDone) {
      api.log.error(
        'ROUTER GUARD: You are trying to go to the next route from ' +
          from.name +
          ' to ' +
          to.name +
          ' but the current page is not marked as done, so returning you to the current page.'
      )
      return {
        name: api.store.lastRoute,
        replace: true,
      }
    }

    // if you're trying to go to the same route you're already on, allow it
    if (api.store.lastRoute === to.name) {
      api.log.log(
        "ROUTER GUARD: You're trying to go to the same route as lastRoute (" +
          api.store.lastRoute +
          '), so allowing it.'
      )
      return true
    }

    // if you're a known user (and not trying to go to the next or same route), send back to most recent route
    if (from.meta !== undefined && from.meta.next !== to.name && api.store.isKnownUser) {
      api.log.error(
        `ROUTER GUARD: You are known and trying to access a route (${to.name}) which is not 'next' \
        on the timeline.  Returning you to the last route you were on (${api.store.lastRoute}).`
      )
      return {
        name: api.store.lastRoute,
        replace: true,
      }
    }

    // if you're a known user (and not trying to go to the next or same route), send back to most recent route
    if (api.store.isKnownUser) {
      api.log.error(
        "ROUTER GUARD: You are known and trying to access a route you can't see yet.  lastRoute: " + api.store.lastRoute
      )
      return {
        name: api.store.lastRoute,
        replace: true,
      }
    }

    if (!api.store.isKnownUser && to.name === 'landing') {
      api.log.error('ROUTER GUARD: Unknown user trying to go to landing page')
      return {
        name: 'welcome_anonymous',
        replace: true,
      }
    }
    if (to.name !== 'welcome_anonymous') {
      // otherwise (for an unknown user who's not trying to go to next/same route), just send to welcome anonymous screen
      api.log.error('ROUTER GUARD: Unknown user blocked trying to go to ' + to.name)
      return {
        name: api.store.lastRoute,
        replace: true,
      }
    }
    return true // is this right? why is the default to allow the navigation?
  })

  /**
   * Router guard that runs before route resolution to handle seeding and view state
   * @param {import('vue-router').RouteLocationNormalized} to - Target route
   * @returns {void}
   */
  r.beforeResolve((to) => {
    const api = useAPI()
    api.removeAutofill()

    if (api.store.browserPersisted.useSeed) {
      // if we're using a seed
      const seedID = api.store.getSeedID
      const seed = `${seedID}-${to.name}`
      seedrandom(seed, { global: true })
      api.log.log('ROUTER GUARD: Seed set to ' + seed)
    } else {
      // if inactive, just re-seed with a random seed on every route entry
      api.randomSeed()
      api.log.log('ROUTER GUARD: Not using participant-specific seed; seed set randomly')
    }
    api.log.clearPageHistory()
    api.store.dev.viewProvidesStepper = false // by default
    api.store.dev.currentViewDone = false // set the current page to done
    api.log.log('ROUTER GUARD: Router navigated to /' + to.name)
  })

  /**
   * Router guard that runs after route navigation is complete to handle preloading of next route
   * @param {import('vue-router').RouteLocationNormalized} to - Target route
   * @param {import('vue-router').RouteLocationNormalized} from - Previous route
   * @returns {Promise<void>} Promise that resolves when preloading is complete
   */
  r.afterEach(async (to, from) => {
    if (to.meta !== undefined && to.meta.next !== undefined) {
      const fullTo = r.resolve({ name: to.meta.next })

      if (fullTo.meta !== undefined && fullTo.meta.preload !== undefined) {
        await fullTo.meta.preload()
      }
    }
  })
}

/**
 * Creates and configures a Vue Router instance for the SMILE application
 * @param {Timeline} timeline - Timeline instance containing route definitions
 * @returns {import('vue-router').Router} Configured Vue Router instance
 */
export function useRouter(timeline) {
  const { routes } = timeline

  // 4. Create the router instance and pass the `routes` option
  // You can pass in additional options here, but let's
  // keep it simple for now.
  const router = createRouter({
    history: createWebHashHistory(), // We are using the hash history for now/simplicity
    routes,
    scrollBehavior(to, from, savedPosition) {
      return { top: 0 }
    },
  })

  return router
}

export default useRouter
