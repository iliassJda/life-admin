/**
 * How to cancel common subscriptions and contracts. Each guide links to the
 * provider's (or regulator's) own help page, which stays the source of truth:
 * menu names change, so steps are kept short.
 * Last checked: November 2026.
 */

export type CancelGuide = {
  id: string;
  name: string;
  /** Lowercase names an item might be called; matched as whole words. */
  aliases: string[];
  url: string;
  steps: string[];
  notes: string[];
};

export const GUIDES_CHECKED = 'November 2026';

const STORE_NOTE =
  'Paying through Apple or Google Play? Cancel in your App Store or Google Play subscriptions instead.';

export const CANCEL_GUIDES: CancelGuide[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    aliases: ['netflix'],
    url: 'https://help.netflix.com/en/node/407',
    steps: [
      'Sign in at netflix.com and open Account.',
      'Under Membership, choose Cancel membership.',
      'Confirm with Finish cancellation.',
    ],
    notes: [
      'You can keep watching until the end of the period you already paid for.',
      'No cancel option? You’re billed through a partner (such as your TV or phone provider); cancel with them.',
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    aliases: ['spotify'],
    url: 'https://support.spotify.com/us/article/cancel-premium/',
    steps: [
      'Open your Spotify account page in a browser.',
      'Go to Manage your plan and choose Cancel subscription.',
    ],
    notes: [
      'Premium stays until your next billing date, then the account switches to free. Playlists are kept.',
      'Family or Duo: only the plan manager can cancel.',
      'Billed through a phone or internet provider? Cancel with them.',
    ],
  },
  {
    id: 'disney',
    name: 'Disney+',
    aliases: ['disney+', 'disney plus', 'disneyplus', 'disney'],
    url: 'https://help.disneyplus.com/en-GB/article/disneyplus-cancel',
    steps: [
      'Sign in to Disney+ on the web or in the app and open Account.',
      'Go to Subscription and choose Cancel subscription.',
    ],
    notes: [
      'Cancelling takes effect at the end of the current billing period.',
      'Subscribed through a partner or app store? Cancel with them.',
    ],
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime',
    aliases: ['amazon prime', 'prime video', 'prime'],
    url: 'https://www.amazon.de/-/en/gp/help/customer/display.html?nodeId=GTJQ7QZY7QL2HK4Y',
    steps: [
      'Sign in on the Amazon site you subscribed on and open Manage Your Prime Membership.',
      'Choose Update, cancel and more, then End membership.',
      'Confirm on the screens that follow.',
    ],
    notes: [
      'If you haven’t used any Prime benefits in the current paid period, you may get a full refund.',
    ],
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    aliases: ['youtube premium', 'youtube music', 'youtube'],
    url: 'https://support.google.com/youtube/answer/6308278',
    steps: [
      'Go to youtube.com/paid_memberships.',
      'Choose Manage membership, then Deactivate, and confirm.',
    ],
    notes: [
      'Benefits continue until the end of the billing period.',
      'Subscribed on an iPhone? Cancel through Apple.',
    ],
  },
  {
    id: 'apple',
    name: 'Apple subscriptions',
    aliases: [
      'apple music',
      'apple tv',
      'apple one',
      'apple arcade',
      'icloud',
      'icloud+',
    ],
    url: 'https://support.apple.com/en-us/118428',
    steps: [
      'On iPhone, open Settings and tap your name.',
      'Tap Subscriptions, choose the subscription, then Cancel subscription.',
    ],
    notes: [
      'On the web: sign in at account.apple.com.',
      'No Cancel button, or an expiry date in red? It’s already cancelled.',
      'Cancel free trials at least 24 hours before they end.',
    ],
  },
  {
    id: 'google-play',
    name: 'Google Play subscriptions',
    aliases: ['google play', 'google one'],
    url: 'https://support.google.com/googleplay/answer/7018481',
    steps: [
      'Open the Play Store, tap your profile picture, then Payments & subscriptions.',
      'Open Subscriptions, choose the subscription and tap Cancel subscription.',
    ],
    notes: [
      'Uninstalling the app does not cancel it.',
      'You keep access for the time you already paid for.',
    ],
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    aliases: ['microsoft 365', 'office 365', 'microsoft office'],
    url: 'https://support.microsoft.com/en-us/accounts-billing/subscriptions/cancel-a-microsoft-365-subscription',
    steps: [
      'Sign in at account.microsoft.com/services with the account that pays.',
      'Choose Cancel subscription (it may say Upgrade or cancel).',
    ],
    notes: [
      'Cancel more than 2 days before the billing date to avoid another charge.',
      'Only seeing “Turn on recurring billing”? It already won’t renew.',
      STORE_NOTE,
    ],
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    aliases: [
      'adobe',
      'creative cloud',
      'adobe creative cloud',
      'photoshop',
      'lightroom',
      'acrobat',
    ],
    url: 'https://helpx.adobe.com/account/individual/terms-policies-and-regulations/adobe-subscription-terms.html',
    steps: [
      'Sign in at account.adobe.com and open Plans.',
      'Choose Manage plan, then Cancel your plan, and follow the steps.',
    ],
    notes: [
      'An annual plan paid monthly can have an early termination fee. Check the amount shown before you confirm.',
      'Switching to another paid plan instead doesn’t trigger the fee.',
    ],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    aliases: ['dropbox'],
    url: 'https://help.dropbox.com/plans/downgrade-dropbox-individual-plans',
    steps: [
      'Sign in at dropbox.com, click your avatar, then Settings or Manage account.',
      'Choose Cancel plan.',
    ],
    notes: [
      'Your account becomes free Dropbox Basic (2 GB) at the end of the billing cycle. Files are not deleted.',
      'No Cancel plan button? You bought it in a mobile app store; cancel there.',
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    aliases: ['chatgpt', 'chatgpt plus', 'chatgpt pro', 'openai'],
    url: 'https://help.openai.com/en/articles/7232927-how-do-i-cancel-my-chatgpt-plus-subscription',
    steps: [
      'Sign in to ChatGPT on the web and open Settings.',
      'Go to Account (or Billing) and choose Cancel plan.',
    ],
    notes: [
      'Cancel at least 24 hours before the next billing date.',
      STORE_NOTE,
    ],
  },
  {
    id: 'audible',
    name: 'Audible',
    aliases: ['audible'],
    url: 'https://help.audible.com/s/article/cancel-membership',
    steps: [
      'Sign in on the Audible website and open Account details (Membership details).',
      'Choose Cancel membership and follow the steps.',
    ],
    notes: [
      'Use your credits first: unused credits are lost when you cancel. Books you bought stay in your library.',
      STORE_NOTE,
    ],
  },
  {
    id: 'deezer',
    name: 'Deezer',
    aliases: ['deezer'],
    url: 'https://support.deezer.com/hc/en-gb/articles/214349245-Cancel-Your-Deezer-Subscription',
    steps: [
      'In the Deezer app or on the website, open Settings from your profile.',
      'Go to your plan management and choose to cancel your subscription.',
    ],
    notes: [
      'Cancel at least 48 hours before the renewal date.',
      'Through a phone provider or Apple? Cancel with them.',
    ],
  },
  {
    id: 'hbo-max',
    name: 'HBO Max',
    aliases: ['hbo max', 'hbomax', 'hbo'],
    url: 'https://help.hbomax.com/us/Answer/Detail/000002526',
    steps: [
      'Go to hbomax.com/subscription and sign in.',
      'Choose Cancel your subscription.',
    ],
    notes: [
      'No cancel option there? You’re billed by someone else (Apple, Google, a TV provider); cancel with them.',
      'Deleting the app does not cancel it.',
    ],
  },
  {
    id: 'playstation-plus',
    name: 'PlayStation Plus',
    aliases: ['playstation plus', 'ps plus', 'playstation', 'psn'],
    url: 'https://www.playstation.com/en-us/support/subscriptions/cancel-playstation-plus/',
    steps: [
      'Sign in to your PlayStation account management on the web and open Subscription.',
      'Choose Cancel subscription next to PlayStation Plus.',
    ],
    notes: [
      'On a PS5: Settings → Users and accounts → Account → Payment and subscriptions → Subscriptions.',
      'Benefits continue until the end of the paid period.',
    ],
  },
  {
    id: 'xbox',
    name: 'Xbox Game Pass',
    aliases: ['xbox', 'game pass', 'xbox game pass'],
    url: 'https://support.xbox.com/en-US/help/subscriptions-billing/manage-subscriptions/cancel-recurring-billing-or-subscription',
    steps: [
      'Sign in at account.microsoft.com/services.',
      'Find Game Pass and turn off recurring billing (Cancel subscription).',
    ],
    notes: [
      'Do it before the next billing date. You keep the benefits until it expires.',
      'Charged by accident? A recent recurring charge can often be refunded if you cancel within 30 days.',
    ],
  },
  {
    id: 'nintendo-switch-online',
    name: 'Nintendo Switch Online',
    aliases: ['nintendo switch online', 'nintendo online', 'nintendo'],
    url: 'https://en-americas-support.nintendo.com/app/answers/detail/a_id/41196',
    steps: [
      'Sign in at accounts.nintendo.com with the account that bought it.',
      'Open Nintendo Switch Online and turn off automatic renewal, then confirm.',
    ],
    notes: [
      'Do it at least 48 hours before the membership ends.',
      'Only the account that bought it can change this.',
    ],
  },
  {
    id: 'basic-fit',
    name: 'Basic-Fit',
    aliases: ['basic-fit', 'basic fit', 'basicfit'],
    url: 'https://www.basic-fit.com/en-nl/cancel',
    steps: [
      'Open the Basic-Fit app or My Basic-Fit on the website.',
      'Choose to cancel your membership and confirm.',
    ],
    notes: [
      'The notice period is 4 weeks. A yearly membership runs at least 52 weeks before it can end.',
      'You can also cancel at the kiosk in your club.',
    ],
  },
  {
    id: 'telecom',
    name: 'Internet, TV and phone',
    aliases: [
      'proximus',
      'telenet',
      'orange',
      'base',
      'scarlet',
      'voo',
      'kpn',
      'ziggo',
      'odido',
      'vodafone',
      't-mobile',
      'internet',
      'phone plan',
      'mobile plan',
    ],
    url: 'https://www.bipt.be/consumers/switching-fixed-operators',
    steps: [
      'Switching to another provider? Let the new one handle it: they cancel the old contract for you once your new service works.',
      'Keeping your number? Tell the new provider, or the number stays with the old one.',
      'Stopping without switching? Cancel with your current provider; check your contract’s end date first.',
    ],
    notes: [
      'Belgium: the Easy Switch procedure covers fixed internet and TV. Early-termination fees can apply to recent fixed-term contracts, and you may need to return the modem or decoder yourself.',
      'Netherlands: after the fixed term, the notice period is at most one month (consument.acm.nl). The overstapservice lets the new provider cancel for you.',
    ],
  },
  {
    id: 'energy',
    name: 'Electricity and gas',
    aliases: [
      'engie',
      'luminus',
      'totalenergies',
      'bolt',
      'octa+',
      'eneco',
      'vattenfall',
      'essent',
      'greenchoice',
      'energy',
      'energy contract',
      'electricity',
      'gas',
    ],
    url: 'https://www.creg.be/nl/consumenten/prijzen-en-tarieven/veranderen-van-energieleverancier',
    steps: [
      'Sign up with the new supplier. They cancel your old contract; you don’t need to contact the old one.',
      'Have your meter readings or EAN codes (on your bill) and bank details ready.',
      'Your old supplier sends a final bill a few weeks after the switch. Supply never stops.',
    ],
    notes: [
      'Belgium: households can switch free of charge at any time, even mid-contract, with one month’s notice (CREG).',
      'Netherlands: a fixed-term contract can carry an exit fee; your old supplier must tell you the amount right after you sign. Variable contracts have none (acm.nl).',
    ],
  },
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function containsWord(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(haystack);
}

/** The guide for an item name, preferring the most specific (longest) alias. */
export function findCancelGuide(itemName: string): CancelGuide | null {
  const name = normalize(itemName);
  let best: { guide: CancelGuide; length: number } | null = null;
  for (const guide of CANCEL_GUIDES) {
    for (const alias of guide.aliases) {
      if (containsWord(name, alias) && (!best || alias.length > best.length)) {
        best = { guide, length: alias.length };
      }
    }
  }
  return best?.guide ?? null;
}
