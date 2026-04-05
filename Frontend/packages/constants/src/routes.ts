export const ROUTES = {
  marketing: {
    home: {label: 'Home', href: '/home'},
    jetPoints: {label: 'Jet Points', href: '/home/#jet-points'},
    whyJetrav: {label: 'Why Jetrav', href: '/home/#why-jetrav'},
    solutions: {label: 'Solutions', href: '/home/#solutions'},
    contact: {label: 'Contact', href: '/home/#contact'},
    phoneNumber: {label: '+91 90999-88132', href: 'tel:+919099988132'},
    email: {label: 'contact@jetrav.com', href: 'mailto:contact@jetrav.com'},
  },
  publicApp: {
    login: {label: 'Login', href: 'https://app.jetrav.com/login'},
    register: {label: 'Register', href: 'https://app.jetrav.com/register'},
  }

} as const;