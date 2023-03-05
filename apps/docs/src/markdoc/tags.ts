import { Callout } from "../components/Callout"
import { QuickLink, QuickLinks } from "../components/QuickLinks"
import EmbeddedStackblitz from "../components/Stackblitz"

const tags = {
  callout: {
    attributes: {
      title: { type: String },
      type: {
        type: String,
        default: 'note',
        matches: ['note', 'warning'],
        errorLevel: 'critical',
      },
    },
    render: Callout,
  },
  stackblitz: {
    selfClosing: true,
    attributes: {
      projectId: { type: String },
      openFile: { type: String },
      height: { type: Number },
      view: { type: String }
    },
    render: EmbeddedStackblitz
  },
  'quick-links': {
    render: QuickLinks,
  },
  'quick-link': {
    selfClosing: true,
    render: QuickLink,
    attributes: {
      title: { type: String },
      description: { type: String },
      icon: { type: String },
      href: { type: String },
    },
  },
}

export default tags
