/**
 * The Trial of Three Runes.
 * Each option: { id, text, score (0-2 toward the question's skill), interest?: { pathId: points } }.
 * "kind" is for display only: choice | log | code | scenario | interest.
 * An "I'm not sure yet" option (score 0) is always appended by the UI, because beginners are welcome.
 */
export const UNSURE_OPTION = { id: 'unsure', text: 'I’m not sure yet', score: 0 };

export const ASSESSMENT_DISCLAIMER =
  'This quick trial suggests a place to start. It is not a validated psychometric test, a skills certification, or a hiring assessment, and every path stays open to you.';

export const ASSESSMENT_QUESTIONS = [
  {
    id: 'net-dns', skill: 'networking', kind: 'choice',
    prompt: 'You type a website name into your browser. What does DNS do?',
    options: [
      { id: 'a', text: 'Turns the name into an IP address your computer can contact', score: 2 },
      { id: 'b', text: 'Encrypts everything you send', score: 0 },
      { id: 'c', text: 'Blocks harmful websites', score: 0 },
    ],
  },
  {
    id: 'net-port', skill: 'networking', kind: 'choice',
    prompt: 'A web server listens on port 443. What is that port normally used for?',
    options: [
      { id: 'a', text: 'HTTPS: web traffic protected with encryption', score: 2 },
      { id: 'b', text: 'Plain, unencrypted web traffic', score: 1 },
      { id: 'c', text: 'Sending email', score: 0 },
    ],
  },
  {
    id: 'web-authn', skill: 'webapp', kind: 'choice',
    prompt: 'What is the difference between authentication and authorization?',
    options: [
      { id: 'a', text: 'Authentication proves who you are; authorization decides what you may do', score: 2 },
      { id: 'b', text: 'They are two names for the same thing', score: 0 },
      { id: 'c', text: 'Authorization proves who you are; authentication decides what you may do', score: 0 },
    ],
  },
  {
    id: 'web-input', skill: 'webapp', kind: 'scenario',
    prompt: 'A site lets visitors type a name into a search box, and it pastes that text directly into a database request. What is the main risk?',
    options: [
      { id: 'a', text: 'Someone could type specially crafted text that changes what the database request does', score: 2 },
      { id: 'b', text: 'The page might load slowly', score: 0 },
      { id: 'c', text: 'The browser might show the wrong font', score: 0 },
    ],
  },
  {
    id: 'log-pattern', skill: 'logs_ir', kind: 'log',
    prompt: 'Read this small log. Which detail deserves the closest look?\n\n09:02:11 login ok     user=mira  src=198.51.100.7\n09:03:02 login failed user=tomas src=203.0.113.50\n09:03:04 login failed user=tomas src=203.0.113.50\n09:03:06 login failed user=tomas src=203.0.113.50\n09:03:09 login ok     user=tomas src=203.0.113.50',
    options: [
      { id: 'a', text: 'Several quick failures, then a success, for one account from one address', score: 2 },
      { id: 'b', text: 'That mira logged in at 09:02', score: 0 },
      { id: 'c', text: 'That two different people appear in the log', score: 0 },
    ],
  },
  {
    id: 'log-fp', skill: 'logs_ir', kind: 'scenario',
    prompt: 'An alert fires, you investigate, and it turns out to be a scheduled maintenance script doing its normal job. What is that outcome called?',
    options: [
      { id: 'a', text: 'A false positive', score: 2 },
      { id: 'b', text: 'A true positive', score: 0 },
      { id: 'c', text: 'A confirmed breach', score: 0 },
    ],
  },
  {
    id: 'code-read', skill: 'coding', kind: 'code',
    prompt: 'Read this line of code:\n\nquery = "SELECT * FROM users WHERE name = \'" + name + "\'"\n\nWhat is the problem?',
    options: [
      { id: 'a', text: 'User-supplied text is joined straight into the query instead of being passed as a safe parameter', score: 2 },
      { id: 'b', text: 'It uses SELECT', score: 0 },
      { id: 'c', text: 'The variable is called name', score: 0 },
    ],
  },
  {
    id: 'code-pass', skill: 'coding', kind: 'choice',
    prompt: 'How should an application store users’ passwords?',
    options: [
      { id: 'a', text: 'As salted hashes made with a slow password-hashing function', score: 2 },
      { id: 'b', text: 'Encrypted, with the key stored next to the database', score: 1 },
      { id: 'c', text: 'In plain text so support can help users who forget them', score: 0 },
    ],
  },
  {
    id: 'vuln-idor', skill: 'vuln', kind: 'scenario',
    prompt: 'A page shows your invoice at /invoice?id=1042. Changing the number to 1043 shows another customer’s invoice. What is the weakness?',
    options: [
      { id: 'a', text: 'Broken access control: the app never checks that this invoice belongs to you', score: 2 },
      { id: 'b', text: 'A weak password', score: 0 },
      { id: 'c', text: 'The page is too slow', score: 0 },
    ],
  },
  {
    id: 'vuln-ethics', skill: 'vuln', kind: 'scenario',
    prompt: 'You notice a possible weakness in a system you do not own. What is the responsible move?',
    options: [
      { id: 'a', text: 'Stop, avoid further testing, and report it to the owner through their disclosure channel', score: 2 },
      { id: 'b', text: 'Keep testing quietly to be sure', score: 0 },
      { id: 'c', text: 'Post it publicly right away', score: 0 },
    ],
  },
  {
    id: 'for-preserve', skill: 'forensics', kind: 'scenario',
    prompt: 'A machine may hold evidence of an incident. What should come first?',
    options: [
      { id: 'a', text: 'Preserve what is there (copy or image it) and write down what you did', score: 2 },
      { id: 'b', text: 'Ask the user what they remember, then decide', score: 1 },
      { id: 'c', text: 'Delete suspicious files and restart to get back to normal', score: 0 },
    ],
  },
  {
    id: 'for-time', skill: 'forensics', kind: 'log',
    prompt: 'One log says 10:00 +00:00 (UTC). Another says 12:00 +02:00. Are they the same moment?',
    options: [
      { id: 'a', text: 'Yes, 12:00 at +02:00 is 10:00 UTC', score: 2 },
      { id: 'b', text: 'No, they are two hours apart', score: 0 },
      { id: 'c', text: 'It is impossible to compare them', score: 1 },
    ],
  },
  {
    id: 'int-task', skill: null, kind: 'interest',
    prompt: 'Which task sounds most appealing right now?',
    options: [
      { id: 'a', text: 'Watching an alarm tower and deciding which alerts are real', interest: { blue: 2 } },
      { id: 'b', text: 'Finding the hidden door in a fictional vault, with permission', interest: { red: 2 } },
      { id: 'c', text: 'Testing whether the wards notice a safe, fictional intruder', interest: { purple: 2 } },
      { id: 'd', text: 'Piecing together what happened from old records', interest: { echoes: 2 } },
    ],
  },
  {
    id: 'int-trouble', skill: null, kind: 'interest',
    prompt: 'When something goes wrong, what would you rather do?',
    options: [
      { id: 'a', text: 'Respond while it is happening and keep things running', interest: { blue: 2 } },
      { id: 'b', text: 'Work out exactly how it was possible', interest: { red: 2 } },
      { id: 'c', text: 'Improve the defenses by testing them again', interest: { purple: 2 } },
      { id: 'd', text: 'Record precisely what occurred, in order', interest: { echoes: 2 } },
    ],
  },
];
