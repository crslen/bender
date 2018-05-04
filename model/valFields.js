"use strict";

let useCases = usecases => {
  return [{
      "text": "Cloud Migrations - Application Specific",
      "value": "Cloud Migrations - Application Specific"
    },
    {
      "text": "Cloud Migrations - Data Center Wide",
      "value": "Cloud Migrations - Data Center Wide"
    },
    {
      "text": "Cloud Migrations - Infrastructure Refresh",
      "value": "Cloud Migrations - Infrastructure Refresh"
    },
    {
      "text": "Data Center Extension - Test/Dev",
      "value": "Data Center Extension - Test/Dev"
    },
    {
      "text": "Data Center Extension - Footprint Expansion",
      "value": "Data Center Extension - Footprint Expansion"
    },
    {
      "text": "Data Center Extension - On-demand Capacity",
      "value": "Data Center Extension - On-demand Capacity"
    },
    {
      "text": "Disaster Recovery - New DR",
      "value": "Disaster Recovery - New DR"
    },
    {
      "text": "Disaster Recovery - Compliment Existing DR",
      "value": "Disaster Recovery - Compliment Existing DR"
    },
    {
      "text": "Disaster Recovery - Replace Existing DR",
      "value": "Disaster Recovery - Replace Existing DR"
    },
    {
      "text": "Next-Gen Apps - App Modernization",
      "value": "Next-Gen Apps - App Modernization"
    },
    {
      "text": "Next-Gen Apps - Next Gen App Buildout",
      "value": "Next-Gen Apps - Next Gen App Buildout"
    },
    {
      "text": "Next-Gen Apps - Emerging Technologies",
      "value": "Next-Gen Apps - Emerging Technologies"
    },
    {
      "text": "Partner Solutions - Partner ISV Solutions",
      "value": "Partner Solutions - Partner ISV Solutions"
    },
    {
      "text": "Partner Solutions - Partner MSP/SISO/SOPRO Solutions",
      "value": "Partner Solutions - Partner MSP/SISO/SOPRO Solutions"
    },
    {
      "text": "Desktops - Horizon View",
      "value": "Desktops - Horizon View"
    },
    {
      "text": "NA",
      "value": "NA"
    }
  ]
};

let awsRegions = awsReg => {
  return [{
      "text": "Available Regions",
      "options": [{
          "text": "US East (N. Virginia)",
          "value": "US East (N. Virginia)"
        },
        {
          "text": "US West (Oregon)",
          "value": "US West (Oregon)"
        },
        {
          "text": "EU (London)",
          "value": "EU (London)"
        }
      ]
    },
    {
      "text": "Regions coming soon",
      "options": [{
          "text": "US East (Ohio)",
          "value": "US East (Ohio)"
        },

        {
          "text": "US West (N. California)",
          "value": "US West (N. California)"
        },

        {
          "text": "Asia Pacific (Tokyo)",
          "value": "Asia Pacific (Tokyo)"
        },
        {
          "text": "Asia Pacific (Seoul)",
          "value": "Asia Pacific (Seoul)"
        },
        {
          "text": "Asia Pacific (Osaka-Local)",
          "value": "Asia Pacific (Osaka-Local)"
        },
        {
          "text": "Asia Pacific (Mumbai)",
          "value": "Asia Pacific (Mumbai)"
        },
        {
          "text": "Asia Pacific (Singapore)",
          "value": "Asia Pacific (Singapore)"
        },
        {
          "text": "Asia Pacific (Sydney)",
          "value": "Asia Pacific (Sydney)"
        },
        {
          "text": "Canada (Central)",
          "value": "Canada (Central)"
        },
        {
          "text": "China (Beijing)",
          "value": "China (Beijing)"
        },
        {
          "text": "China (Ningxia)",
          "value": "China (Ningxia)"
        },
        {
          "text": "EU (Frankfurt)",
          "value": "EU (Frankfurt)"
        },
        {
          "text": "EU (Ireland)",
          "value": "EU (Ireland)"
        },
        {
          "text": "EU (Paris)",
          "value": "EU (Paris)"
        },
        {
          "text": "South America (Sao Paulo)",
          "value": "South America (Sao Paulo)"
        }
      ]
    }

  ]
};

let compliance = compDD => {
  return [{
      "text": "CSA",
      "value": "CSA"
    },
    {
      "text": "FedRAMP",
      "value": "FedRAMP"
    },
    {
      "text": "CJIS",
      "value": "CJIS"
    },
    {
      "text": "GDPR",
      "value": "GDPR"
    },
    {
      "text": "HIPAA",
      "value": "HIPAA"
    },
    {
      "text": "ISO",
      "value": "ISO"
    },
    {
      "text": "PCI",
      "value": "PCI"
    },
    {
      "text": "SOC 1",
      "value": "SOC 1"
    },
    {
      "text": "SOC 2",
      "value": "SOC 2"
    },
    {
      "text": "SOC 3",
      "value": "SOC 3"
    }
  ]
};

let services = servicesDD => {
  return [{
      "text": "Add Ons",
      "options": [{
          "text": "Hybrid Cloud Extension",
          "value": "Hybrid Cloud Extension"
        },
        {
          "text": "Site Recovery",
          "value": "Site Recovery"
        }
      ]
    },
    {
      "text": "Services",
      "options": [{
          "text": "Cost Insight",
          "value": "Cost Insight"
        },
        {
          "text": "Discovery",
          "value": "Discovery"
        },
        {
          "text": "Log Intelligence",
          "value": "Log Intelligence"
        },
        {
          "text": "Network Insight",
          "value": "Network Insight"
        },
        {
          "text": "None",
          "value": "None"
        }
      ]
    }
  ]
};


let status = statusDD => {
  return [{
      "text": "Planning",
      "value": "Planning"
    },
    {
      "text": "Active",
      "value": "Active"
    },
    {
      "text": "Stalled",
      "value": "Stalled"
    },
    {
      "text": "Technical - Win",
      "value": "Technical Win"
    },
    {
      "text": "Technical - Waiting",
      "value": "Technical Waiting"
    },
    {
      "text": "Technical - Loss",
      "value": "Technical Loss"
    },
    {
      "text": "Cancelled",
      "value": "Cancelled"
    }
  ]
};

let uFields = fieldDD => {
  return [{
      "text": "Tech Validation Fields",
      "options": [{
          "text": "Account Name",
          "value": "Customer_Name"
        },
        {
          "text": "SFDC CSO ID",
          "value": "SFDC_OPPTY_ID"
        },
        {
          "text": "Status",
          "value": "Status"
        },
        {
          "text": "SET Member",
          "value": "SE_Specialist"
        },
        {
          "text": "Type",
          "value": "Type"
        },
        {
          "text": "Use Case(s)",
          "value": "Use_Case"
        },
        {
          "text": "AWS Region(s)",
          "value": "AWS_Region"
        },
        {
          "text": "Compliance",
          "value": "Compliance"
        },
        {
          "text": "Service(s)",
          "value": "Services"
        },
        {
          "text": "Expected Start Date",
          "value": "Actual_Start_Date"
        },
        {
          "text": "Expected End Date",
          "value": "End_date"
        },
        {
          "text": "Org ID",
          "value": "ORG_ID"
        },
        {
          "text": "Refresh Token",
          "value": "refresh_token"
        },
        {
          "text": "Notes",
          "value": "Notes"
        },
        {
          "text": "Cloud Specialist",
          "value": "Cloud_Specialist"
        }
      ]
    },
    {
      "text": "Consumption Plan Fields",
      "options": [{
          "text": "CS Architect",
          "value": "CS_Architect"
        },
        {
          "text": "CS Manager",
          "value": "CS_Manager"
        },
        {
          "text": "Customer Email",
          "value": "Customer_Email"
        },
        {
          "text": "Current Number of Hosts",
          "value": "current_host_count"
        },
        {
          "text": "Expected Number of Hosts",
          "value": "expected_num_hosts"
        },
        {
          "text": "VMC Reference",
          "value": "vmc_reference"
        },
        {
          "text": "Opportunity Close Date",
          "value": "oppty_close_date"
        },
        {
          "text": "Onboarding Date",
          "value": "est_onboarding_date"
        },
        {
          "text": "Go Live Date",
          "value": "est_go_live_date"
        },
        {
          "text": "Customer Requirements",
          "value": "customer_requirements"
        },
        {
          "text": "Use Case Scenario",
          "value": "use_case_scenario"
        }
      ]
    }
  ]
};

//random thoughts

//words of encouragement
let yayMessage = yayMsg => {
  var message_options = [
    "Boom!",
    "Bam!",
    "Woot!",
    "Woohoo!",
    ":BananaDance:",
    ":bender:",
    ":parrotbeer:"
  ]
  var random_index = Math.floor(Math.random() * message_options.length)
  var chosen_message = message_options[random_index]
  return chosen_message;
};

//Futurama Quotes
let futQuotes = futQuotes => {
  var message_options = [
    "We’re making beer. I’m the brewery!",
    "Well, if jacking on will make strangers think I’m cool, I’ll do it.",
    "I’m so embarrassed. I wish everybody else was dead.",
    "Have you ever tried simply turning off your TV, sitting down with your child, and hitting them?",
    "There. Now no one can say I don’t own John Larroquette’s spine.",
    "Hey sexy mama. Wanna kill all humans?",
    "Blackmail is such an ugly word. I prefer extortion. The ‘x’ makes it sound cool.",
    "I got ants in my butt, and I needs to strut. :bender:",
    "Oh, no room for Bender, huh? Fine! I’ll go build my own lunar lander, with blackjack and hookers. In fact, forget the lunar lander and the blackjack. Ahh, screw the whole thing!",
    "That’s what they said about being alive!",
    "Game’s over, losers! I have all the money. Compare your lives to mine and then kill yourselves.",
    "O’ cruel fate, to be thusly boned! Ask not for whom the bone bones—it bones for thee.",
    "Hey, whose been messing with my radio? This isn’t alternative rock, it’s college rock.",
    "My story is a lot like yours, only more interesting ‘cause it involves robots.",
    "We’ll soon stage an attack on technology worthy of being chronicled in an anthem by Rush!"
  ]
  var random_index = Math.floor(Math.random() * message_options.length)
  var chosen_message = message_options[random_index]
  return chosen_message;
};

exports.useCases = useCases;
exports.awsRegions = awsRegions;
exports.compliance = compliance;
exports.status = status;
exports.uFields = uFields;
exports.services = services;
exports.yayMessage = yayMessage;
exports.futQuotes = futQuotes;
