let storageQuestions = storageQuestions => {
  return [{
    "event": "EBS Storage Sizing Samples",
    "userId": "clennon@vmware.com",
    "description": "Gather data for Benkat Kolli for on descisions EBS Storage increments.",
    "helper": "@bender do something",
    "Questions": [{
        "Question": "What is the customer name?",
        "variable": "customer_name"
      },
      {
        "Question": "What is the Total Storage Allocated (TB)?",
        "variable": "storage_allocated"
      },
      {
        "Question": "What is the total number of VM's?",
        "variable": "total_vms"
      },
      {
        "Question": "Please provide notes about this customer related to EBS storage",
        "variable": "notes"
      }
    ]
  }]
};

exports.storageQuestions = storageQuestions;
