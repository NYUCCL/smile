/* eslint-disable import/no-duplicates */
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import specific icons */
/* to limit the size of the final project you import individal icons */
/* NOTE: you also have to load them below by adding to the library */
import { faA, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { faArrowsTurnToDots } from '@fortawesome/free-solid-svg-icons'
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { faExplosion } from '@fortawesome/free-solid-svg-icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons'
import { faDatabase } from '@fortawesome/free-solid-svg-icons'
import { faRainbow } from '@fortawesome/free-solid-svg-icons'
import { faFaceLaughBeam } from '@fortawesome/free-solid-svg-icons'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'

import { faHand } from '@fortawesome/free-solid-svg-icons'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { faBahai } from '@fortawesome/free-solid-svg-icons'
import { faFaceGrinWide } from '@fortawesome/free-solid-svg-icons'
import { faShapes } from '@fortawesome/free-solid-svg-icons'
import { faImage } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUserSecret, faGear, faBook, faArrowsTurnToDots, faArrowRotateLeft)
library.add(faExplosion, faArrowRight, faSquareCheck, faDatabase, faRainbow)
library.add(faFaceLaughBeam, faGlobe, faHand, faMagnifyingGlass, faCircleXmark)
library.add(faBahai, faFaceGrinWide, faShapes, faImage)