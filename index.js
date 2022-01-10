const express = require('express');
const axios = require('axios');
const path = require('path');

//var XMLHttpRequest = require('xhr2');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 5000
//const baseUrl ="https://guarded-shore-31166.herokuapp.com/"
const baseUrl ="http://localhost:5000"

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.set("view engine","ejs")

app.get('/', (request, response) => {
	response.render("index",{urlBase:baseUrl})
});
app.get('/demo',(request, response) => {
	console.log("Demo Route")
	response.render("demo",{urlBase:baseUrl})
});
app.get('/swagger',(request,response)=>{
	console.log("swagger route")
	response.render("swagger",{urlBase:baseUrl})
})
app.get('/:ticker/:startDate/:endDate/:moneyInvested', (request, response) => {
	var ticker = request.params["ticker"]
	var startDate =request.params["startDate"]
	var endDate = request.params["endDate"]
	var investmentAmount = request.params["moneyInvested"]
	var startDatePrice = 0;
	var endDatePrice = 0;
	var valuePercentChange = 0;
	var endInvestmentValue;
	startDatePrice = calculateDatePrice(startDate,ticker)
	endDatePrice = calculateDatePrice(endDate,ticker)
	valuePercentChange = parseInt(endDatePrice)-parseInt(startDatePrice)
	valuePercentChange = valuePercentChange/parseInt(startDatePrice);
	endInvestmentValue = investmentAmount * parseInt(endDatePrice)/parseInt(startDatePrice);
	valuePercentChange = valuePercentChange *100;

	//formatting
	endDatePrice = endDatePrice.toLocaleString(undefined,{maximumFractionDigits:2})
	endInvestmentValue = endInvestmentValue.toLocaleString(undefined,{maximumFractionDigits:2})
	valuePercentChange = valuePercentChange.toLocaleString(undefined,{maximumFractionDigits:2})
	console.log("Inital Investment: " ,investmentAmount)
	console.log("Start Date Price: $",startDatePrice)
	console.log("End Date Price: $",endDatePrice)
	console.log("Value Change in Percetage: ",valuePercentChange,"%")
	console.log("Ending Investment: $",endInvestmentValue)
	response.json({"initalInvestment":investmentAmount,"startDataPrice":startDatePrice
,"endDatePrice":endDatePrice,"percentChange":valuePercentChange,"endInvestmentValue":endInvestmentValue,"currency":"USD","ticker":ticker,
"startDate":startDate,"endDate":endDate,"valueBase":"daily-low"})
});
app.post('/results' ,(request, response) => {
	
	var formData = request.body
	var startDatePrice = 0;
	var endDatePrice = 0;
	var valuePercentChange = 0;
	var endInvestmentValue;
	var resultsObj = {};
	console.log("Form Data ",formData)
	startDatePrice = calculateDatePrice(formData.startDate,formData.ticker)
	endDatePrice = calculateDatePrice(formData.endDate,formData.ticker)
	valuePercentChange = parseInt(endDatePrice)-parseInt(startDatePrice)
	valuePercentChange = valuePercentChange/parseInt(startDatePrice);
	endInvestmentValue = parseInt(formData.investmentAmount) * valuePercentChange + parseInt(formData.investmentAmount);
	valuePercentChange = valuePercentChange *100;

	endDatePrice = endDatePrice.toLocaleString(undefined,{maximumFractionDigits:2})
	endInvestmentValue = endInvestmentValue.toLocaleString(undefined,{maximumFractionDigits:2})
	valuePercentChange = valuePercentChange.toLocaleString(undefined,{maximumFractionDigits:2})
	console.log("Inital Investment: " ,formData.investmentAmount)
	console.log("Start Date Price: $",startDatePrice)
	console.log("End Date Price: $",endDatePrice)
	console.log("Value Change in Percetage: ",valuePercentChange,"%")
	console.log("Ending Investment: $",endInvestmentValue)
	resultsObj = {initalInvestment:formData.investmentAmount,startDataPrice:startDatePrice
,endDatePrice:endDatePrice,percentChange:valuePercentChange,endInvestmentValue:endInvestmentValue,currency:"USD",ticker:formData.ticker,
startDate:formData.startDate,endDate:formData.endDate,valueBase:"daily-low"}
	response.render("demoResults",{urlBase:baseUrl,result:resultsObj})
	


	
	
});


function calculateDatePrice(startDate,ticker){
	var accessKey = "ae3ede0ee07f2b6849daa0d6325ae5bb";
	var dateQuery = "http://api.marketstack.com/v1/eod/"+startDate+"?access_key="+accessKey+"&symbols="+ticker;
	var datePrice = "";
	console.log("Date Query ",dateQuery)
	var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", dateQuery, false ); // false for synchronous request
    xmlHttp.responseType ='json'
    xmlHttp.send();
    jsonRes = JSON.stringify(xmlHttp.responseText)
    jsonRes = jsonRes.split('\\"')
    for(i=0;i<jsonRes.length;i++){
    	if(jsonRes[i]=="low"){
    		datePrice = jsonRes[i+1]

    	}
    }
    datePrice = datePrice.replace(" ","")
    datePrice = datePrice.replace(",","")
    datePrice = datePrice.replace(":","")
    return parseInt(datePrice)
}
app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
});