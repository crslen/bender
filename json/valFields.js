"use strict";

let useCases = usecases => {
	return  [
            {
              "text": "Application Specific (Cloud Migrations)",
              "value": "Application Specific (Cloud Migrations)"
            },
            {
              "text": "Data Center Wide (Cloud Migrations)",
              "value": "Data Center Wide (Cloud Migrations)"
            },
            {
              "text": "Test/Dev (On-demand Capacity)",
              "value": "Test/Dev (On-demand Capacity)"
            },
            {
              "text": "Infrastructure Refresh (On-demand Capacity)",
              "value": "Infrastructure Refresh (On-demand Capacity)"
            },
            {
              "text": "Footprint Expansion (On-demand Capacity)",
              "value": "Footprint Expansion (On-demand Capacity)"
            },
            {
              "text": "Cyclical Capacity (On-demand Capacity)",
              "value": "Cyclical Capacity (On-demand Capacity)"
            },
            {
              "text": "Protect Additional Workloads (Disaster Recovery)",
              "value": "Protect Additional Workloads (Disaster Recovery)"
            },
            {
              "text": "DR Data Center Replacement (Disaster Recovery)",
              "value": "DR Data Center Replacement (Disaster Recovery)"
            },
            {
              "text": "Modernize Legacy DR Solutions (Disaster Recovery)",
              "value": "Modernize Legacy DR Solutions (Disaster Recovery)"
            },
            {
              "text": "Partner Services Development (Other)",
              "value": "Partner Services Development (Other)"
            },
            {
              "text": "Desktops (Other)",
              "value": "Desktops (Other)"
            },
            {
              "text": "NA",
              "value": "NA"
            }
          ]
};

let awsRegions = awsReg => {
	return  [
    {
      "text": "US East (Ohio)",
      "value": "US East (Ohio)"
    },
    {
      "text": "US East (N. Virginia) Available",
      "value": "US East (N. Virginia)"
    },
    {
      "text": "US West (N. California)",
      "value": "US West (N. California)"
    },
    {
      "text": "US West (Oregon) Available",
      "value": "US West (Oregon)"
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
      "text": "sia Pacific (Singapore)",
      "value": "sia Pacific (Singapore)"
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
      "text": "EU (London) Available",
      "value": "EU (London)"
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
};

let compliance = compDD => {
	return  [
    {
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

let status = statusDD =>{
  return [
    {
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
      "text": "Complete - Won",
      "value": "Complete Won"
    },
    {
      "text": "Complete - On hold",
      "value": "Complete On hold"
    },
    {
      "text": "Complete - Lost",
      "value": "Complete Lost"
    }
  ]
};

let uFields = fieldDD =>{
  return [
    {
      "text": "Customer Name",
      "value": "Customer_Name"
    },
    {
      "text": "SF Opp ID",
      "value": "SFDC_OPPTY_ID"
    },
    {
      "text": "Status",
      "value": "Status"
    },
    {
      "text": "Type",
      "value": "Type"
    },
    {
      "text": "Primary Use Case",
      "value": "Primary_Use_Case"
    },
    {
      "text": "Secondary Use Case",
      "value": "Secondary_Use_Case"
    },
    {
      "text": "Primary AWS Region",
      "value": "Primary_AWS_Region"
    },
    {
      "text": "Secondary AWS Region",
      "value": "Secondary_AWS_Region"
    },
    {
      "text": "Start Date",
      "value": "Actual_Start_Date"
    },
    {
      "text": "End Date",
      "value": "End_date"
    },
    {
      "text": "Compliance",
      "value": "Compliance"
    },
    {
      "text": "Org ID",
      "value": "ORG_ID"
    },
    {
      "text": "Notes",
      "value": "Notes"
    },
    {
      "text": "Cloud Specialist",
      "value": "Cloud_Specialist"
    },
    {
      "text": "CS Architect",
      "value": "CS_Architect"
    },
    {
      "text": "Customer Email",
      "value": "Customer_Email"
    },
    {
      "text": "Expected Number of Hosts (paid)",
      "value": "expected_num_hosts"
    }
  ]
};

exports.useCases = useCases;
exports.awsRegions = awsRegions;
exports.compliance = compliance;
exports.status = status;
exports.uFields = uFields;

