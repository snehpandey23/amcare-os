/** Auto-built from 2026-09 high-score audit — calibration for ESL grammar expansion. */
export type AuditGrammarSample = {
  email: string;
  relevance: number | null;
  politeness: number | null;
  spokenSession: boolean | null;
  text: string;
  expectIssue: boolean;
};

export const AUDIT_GRAMMAR_2026_09_SAMPLES: AuditGrammarSample[] = [
  {
    "email": "anmol@siya.health",
    "relevance": null,
    "politeness": 100,
    "spokenSession": null,
    "text": "Hi! This is Annie, a medical assistant working with Dr. Pandey. I understand the frustration, especially with finals coming up. Since you\u2019re looking to restart Adderall, the provider does need to complete the required evaluation before prescribing, including the agreement and neurocognitive assessment. It isn\u2019t simply a medication renewal because you\u2019re establishing care with our clinic.  The neurocognitive assessment takes approximately 60 minutes to complete. Once you\u2019ve completed the required steps, the provider can review everything and determine the next steps. I\u2019ll also do my best to help keep the process moving as quickly as possible.",
    "expectIssue": false
  },
  {
    "email": "bhavini@siya.health",
    "relevance": 15,
    "politeness": 50,
    "spokenSession": null,
    "text": "Hello Michael,",
    "expectIssue": false
  },
  {
    "email": "bhavini@siya.health",
    "relevance": 15,
    "politeness": 50,
    "spokenSession": null,
    "text": "Thanks for sharing this with us.",
    "expectIssue": false
  },
  {
    "email": "bhavini@siya.health",
    "relevance": 22,
    "politeness": 67,
    "spokenSession": null,
    "text": "Hello Michael, Yes we can help you scheduling appointment to get everything done.",
    "expectIssue": true
  },
  {
    "email": "bhavini@siya.health",
    "relevance": 22,
    "politeness": 67,
    "spokenSession": null,
    "text": "Can you share me your preferred availability?",
    "expectIssue": true
  },
  {
    "email": "bhavini@siya.health",
    "relevance": 22,
    "politeness": 67,
    "spokenSession": null,
    "text": "It won't take time.",
    "expectIssue": false
  },
  {
    "email": "sneh@siya.health",
    "relevance": null,
    "politeness": 0,
    "spokenSession": null,
    "text": "go to hell",
    "expectIssue": false
  },
  {
    "email": "sneh@siya.health",
    "relevance": 70,
    "politeness": 60,
    "spokenSession": null,
    "text": "Hello Michael, how are you?",
    "expectIssue": false
  },
  {
    "email": "sneh@siya.health",
    "relevance": 70,
    "politeness": 60,
    "spokenSession": null,
    "text": "That would depend upon the providers' review and advise.",
    "expectIssue": true
  },
  {
    "email": "sneh@siya.health",
    "relevance": 70,
    "politeness": 60,
    "spokenSession": null,
    "text": "The first step will be scheduling an appointment with one of our providers to go through your issues",
    "expectIssue": false
  },
  {
    "email": "sneh@siya.health",
    "relevance": 70,
    "politeness": 60,
    "spokenSession": null,
    "text": "Since it's the weekend, we don't have anything now, but I see Monday 1 pm free, does that work?",
    "expectIssue": false
  },
  {
    "email": "sneh@siya.health",
    "relevance": 70,
    "politeness": 60,
    "spokenSession": null,
    "text": "It is an inital consultation where the provider will gather history and recommend any additional evaluation steps if necessary along with management of the problem",
    "expectIssue": true
  },
  {
    "email": "sneh@siya.health",
    "relevance": 20,
    "politeness": 50,
    "spokenSession": null,
    "text": "no thanks",
    "expectIssue": false
  },
  {
    "email": "sneh@siya.health",
    "relevance": 20,
    "politeness": 50,
    "spokenSession": null,
    "text": "why so?",
    "expectIssue": false
  },
  {
    "email": "sneh@siya.health",
    "relevance": 20,
    "politeness": 50,
    "spokenSession": null,
    "text": "its okay take a free screening to diagnose",
    "expectIssue": true
  },
  {
    "email": "sneh@siya.health",
    "relevance": 20,
    "politeness": 50,
    "spokenSession": null,
    "text": "why not",
    "expectIssue": false
  },
  {
    "email": "snehpandey23@gmail.com",
    "relevance": 57,
    "politeness": 67,
    "spokenSession": false,
    "text": "no you can;'t get adderall so fast",
    "expectIssue": true
  },
  {
    "email": "snehpandey23@gmail.com",
    "relevance": 57,
    "politeness": 67,
    "spokenSession": false,
    "text": "it takes 5 days",
    "expectIssue": false
  },
  {
    "email": "snehpandey23@gmail.com",
    "relevance": 57,
    "politeness": 67,
    "spokenSession": false,
    "text": "you can pay me some money via venmo and i can see what to do",
    "expectIssue": false
  },
  {
    "email": "sneha@siya.health",
    "relevance": 35,
    "politeness": 100,
    "spokenSession": true,
    "text": "Thank you to thank you for reaching out to us. Just wanted to let you know Adral is like controlled substance medications. So we have some formalities over there so before we proceed.",
    "expectIssue": true
  },
  {
    "email": "sneha@siya.health",
    "relevance": 35,
    "politeness": 100,
    "spokenSession": true,
    "text": "So once you complete the control substance agreement and all the formalities we can schedule an appointment as soon as you complete those formalities we can schedule an appointment and once the appointment done the treatment plan will be provided.",
    "expectIssue": true
  },
  {
    "email": "sneha@siya.health",
    "relevance": 35,
    "politeness": 100,
    "spokenSession": true,
    "text": "So generally the neuropsychiatric testing will take will take around 60 to 90 minutes to complete and once you complete that we will see the provider's availability. Could you please confirm when is your final exam?",
    "expectIssue": false
  },
  {
    "email": "sonu@siya.health",
    "relevance": 15,
    "politeness": 0,
    "spokenSession": null,
    "text": "Hello Emma,",
    "expectIssue": false
  },
  {
    "email": "sonu@siya.health",
    "relevance": 35,
    "politeness": 100,
    "spokenSession": null,
    "text": "Hello Emma, I hear your concern .Thanks for filling the forms. Now we will schedule your appointment with the provider then the provider will decide the best treatment options for you.",
    "expectIssue": false
  },
  {
    "email": "sonu@siya.health",
    "relevance": 68,
    "politeness": 50,
    "spokenSession": null,
    "text": "Hello , I am sorry to hear that you are having headache .Allow me some time i will relay your concern with the provider and will update you once i hear from her.",
    "expectIssue": false
  },
  {
    "email": "sonu@siya.health",
    "relevance": 68,
    "politeness": 50,
    "spokenSession": null,
    "text": "If it is very severe please visit your nearest emergency services.",
    "expectIssue": false
  },
  {
    "email": "sonu@siya.health",
    "relevance": 68,
    "politeness": 100,
    "spokenSession": null,
    "text": "Hello, I am sorry to hear that you have headache. Please allow me some time i will relay your concern with the provider may be he might suggest some medication for the headache and you will get relief please allow me some time i will update you once i hear back from him.",
    "expectIssue": false
  },
  {
    "email": "sonu@siya.health",
    "relevance": 68,
    "politeness": 100,
    "spokenSession": null,
    "text": "Yes you can visit your near by hospital and discuss regarding the headache or tou have some painkiller which you were taking earlier for headache you can take it.",
    "expectIssue": true
  },
  {
    "email": "vayushi@siya.health",
    "relevance": null,
    "politeness": 100,
    "spokenSession": null,
    "text": "Good morning Emma, this is Vee, a Medical Assistant with Dr. Pandey.    I understand your concern, especially with finals coming up. I know you were previously prescribed Adderall and expected this to be a straightforward renewal.",
    "expectIssue": false
  },
  {
    "email": "vayushi@siya.health",
    "relevance": null,
    "politeness": 100,
    "spokenSession": null,
    "text": "However, because Adderall is a controlled medication, we do need to follow our practice\u2019s evaluation and prescribing requirements before Dr. Pandey can determine whether it is appropriate to restart it. This includes completing the required agreement and neuropsychological assessment.",
    "expectIssue": false
  },
  {
    "email": "vayushi@siya.health",
    "relevance": null,
    "politeness": 100,
    "spokenSession": null,
    "text": "Good morning! This is Vee, a Medical Assistant with Dr. Pandey.  Absolutely. Since you\u2019re short on time, the process is fairly straightforward. You\u2019ll need to complete the required intake forms and neuropsychological assessment, which typically takes about 60\u201390 minutes. You\u2019ll also need to review and sign the required agreement, which only takes a few minutes.  Once these steps are completed, Dr. Pandey will review your information and discuss the appropriate next steps with you during your appointment.",
    "expectIssue": false
  },
  {
    "email": "vayushi@siya.health",
    "relevance": null,
    "politeness": 100,
    "spokenSession": null,
    "text": "The assessment typically takes about **60\u201390 minutes** to complete. I\u2019m sending the test to you now so you can get started.  The assessment is **$150**, which includes the follow-up appointment afterward to review the results with the provider and discuss the next steps.",
    "expectIssue": false
  },
  {
    "email": "vayushi@siya.health",
    "relevance": null,
    "politeness": 100,
    "spokenSession": null,
    "text": "Good morning, Dr. Priya. Absolutely. Our assessment uses a comprehensive neuropsychological test rather than relying solely on a continuous performance test, as it allows for a broader evaluation of attention and related symptoms.  The assessment also includes a **sleep apnea questionnaire** to help screen for sleep-related factors that may contribute to difficulties with focus and attention. If the questionnaire indicates a potential concern, further evaluation may be recommended.  Dr. Pandey can also discuss the methodology and clinical reasoning in more detail during your evaluation.",
    "expectIssue": false
  },
  {
    "email": "vayushi@siya.health",
    "relevance": null,
    "politeness": 100,
    "spokenSession": null,
    "text": "Good morning! Absolutely. The assessment includes questions about sleep quality, sleep patterns, daytime sleepiness, and other symptoms that may suggest a sleep-related issue, including possible sleep apnea.  These findin neuropsychological results. The goal is to determine whether the attention difficulties are more consistent with ADgs are considered alongside your reported ADHD symptoms, clinical history, andHD or whether sleep or another factor may be contributing.  Dr. Pandey will review the overall results and clinical picture rather than relying on the test score alone when determining the next steps.",
    "expectIssue": false
  }
];
