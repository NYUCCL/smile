import DefaultTheme from 'vitepress/theme'

import DarkModeImage from './DarkModeImage.vue'
import GureckisLabText from './GureckisLabText.vue'
import SmileText from './SmileText.vue'
import { TwoCol, TitleTwoCol, ConstrainedTaskWindow, ConstrainedPage } from '@/uikit/layouts'
import { Button } from '@/uikit/components/ui/button'
import { Badge } from '@/uikit/components/ui/badge'
import { ButtonGroup, ButtonGroupItem } from '@/uikit/components/ui/button-group'
import { Checkbox } from '@/uikit/components/ui/checkbox'
import { Switch } from '@/uikit/components/ui/switch'
import {
  Plus,
  Download,
  Check,
  AlertTriangle,
  Trash,
  Info,
  Settings,
  Edit,
  Heart,
  ThumbsUp,
  Clock,
  X,
  HelpCircle,
} from 'lucide-vue-next'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('DarkModeImage', DarkModeImage)
    app.component('GureckisLabText', GureckisLabText)
    app.component('SmileText', SmileText)
    app.component('Button', Button)
    app.component('Badge', Badge)
    app.component('ButtonGroup', ButtonGroup)
    app.component('ButtonGroupItem', ButtonGroupItem)
    app.component('Checkbox', Checkbox)
    app.component('Switch', Switch)

    // layouts
    app.component('TwoCol', TwoCol)
    app.component('TitleTwoCol', TitleTwoCol)
    app.component('ConstrainedTaskWindow', ConstrainedTaskWindow)
    app.component('ConstrainedPage', ConstrainedPage)

    // Register Lucide icons
    app.component('Plus', Plus)
    app.component('Download', Download)
    app.component('Check', Check)
    app.component('AlertTriangle', AlertTriangle)
    app.component('Trash', Trash)
    app.component('Info', Info)
    app.component('Settings', Settings)
    app.component('Edit', Edit)
    app.component('Heart', Heart)
    app.component('ThumbsUp', ThumbsUp)
    app.component('Clock', Clock)
    app.component('X', X)
    app.component('HelpCircle', HelpCircle)
  },
}
