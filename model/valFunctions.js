"use strict";
const sql = require('mssql')
const config = {
  user: process.env.sql_user,
  password: process.env.sql_password,
  server: process.env.sql_server, // You can use 'localhost\\instance' to connect to named instance
  database: process.env.sql_database,
  options: {
    encrypt: false // Use this if you're on Windows Azure
  }
}

/* Utility function to get SDDC info*/
function getSDDC(orgId, rToken, callback) {
  var request = require('request');
  //get auth token
  request.post({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    form: {
      "refresh_token": rToken
    },
    url: "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize"
  }, function(error, response, body) {
    var jsonStr = JSON.parse(body);
    var rToken = jsonStr.access_token;
    console.log("token-" + rToken);
    //return callback(rToken);
    //get sddc status
    var request = require('request');
    request.get({
      headers: {
        'csp-auth-token': rToken,
        'Content-Type': 'application/json'
      },
      url: "https://vmc.vmware.com/vmc/api/orgs/" + orgId + "/sddcs"
      //url: "https://vmc.vmware.com/vmc/api/orgs"
    }, function(error, response, body) {
      return callback(body);
    });
  });
}

//get refresh token for a customer poc
function getToken(customer, callback) {
  customer = customer.replace("&", "_");
  let sqlQuery;

  sqlQuery = `select org_id, refresh_token
                from dbo.tech_validation
                where customer_name like '%${customer}%'`;

  sql.connect(config, err => {
    console.log("connect error: " + err);

    new sql.Request().query(sqlQuery, (err, result) => {
      // ... error checks
      sql.close();
      console.log(result);
      return callback(result.recordset);
    })

  })

  sql.on('error', err => {
    console.log("on error:" + err);
  })
}

exports.getSDDC = getSDDC;
exports.getToken = getToken;
