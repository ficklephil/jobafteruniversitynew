var ractive = new Ractive({
    el:'container',
    template:'#myTemplate',
    data: {greeting:'hello',recipient:'sdsds',estimatedPayWeekly:0,estimatedPayMonthly:0,estimatedPayYearly:0,easYearlyPayGraduationYear:0,jobTitle:'Job Title Holder',jobDescription:'Job Description',jobTasks:'Job Tasks',
        qualificationsRequired:'Qualifications Holder',workFutureJobs:2323,
        percentSkillsShortages:0,percentHardToFill:20,percentHardToFillIsSkillsShortages:21,unemploymentRate:0,
        yearsAtUniversity:0,graduationYear:0,jobPercentageChange:0,employedCurrently:0,employedGraduationYear:0,jobIncreaseOrDecreased:'no data',jobIncreaseOrDecrease:'no data',changeInNumberOfEmployed:0,rentPrices:[],buyPrices:[],userExpenses:500,userFutureExpenses:0,userSavingPerMonth:0,regionName:'Unknown region',futureRentPriceData:[],estimatedFuturePayMonthly:0,homeBuyersDeposits:[]}
});

$( "#career-input" ).autocomplete({
    source: function( request, response ) {
        $.ajax({
            url: "http://api.lmiforall.org.uk/api/v1/soc/search?q="+request.term,
            dataType: "jsonp",
            data: {
                featureClass: "P",
                style: "full",
                maxRows: 12
            },
            success: function( data ) {
                response( $.map( data, function( item ) {
                    return {
                        value: item.title,
                        soc: item.soc
                    }
                }));
            }
        });
    },
    minLength: 3,
    delay: 50,
    select: function( event, ui ) {
        search(ui.item.soc);
    },
    open: function() {
        console.log('open');
//        $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
    },
    close: function() {

        console.log('close');
//        $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
    },
    change: function(){
      console.log('change');
    },

    focus: function(event, ui){
        console.log('focus');

        console.log('Soc code of selected item is ' + ui.item.soc);
        var soc = ui.item.soc;
    }
});

function search(soc){

    setStoredSocCode(soc);
    getExpenses();
    calcUsersFutureExpenses(getExpenses(),getCurrentYear(),getGraduationYear());
    setYearsAtUniversity(getGraduationYear(), getCurrentYear());
    scrollToStart();

    ractive.set("userExpenses", getExpenses());
    ractive.set("graduationYear", getGraduationYear());
    ractive.set("regionName", getRegionName());

    //Get Estimated Pay Data from LMI API
    apiService('http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc='+soc+'&coarse=true&filters=region%3A'+getRegionCode(),
                                                            parseEstimatedPay,'Cannot Access Estimated Pay LMI Data.');

    //Get Extended Data from LMI API
    apiService('http://api.lmiforall.org.uk/api/v1/soc/code/'+soc, parseExtendedJobData,
                                                                            'Cannot Access Extended Job LMI Data.');

    //Get Skills Shortage Data from LMI API
    apiService('http://api.lmiforall.org.uk/api/v1/ess/region/'+getRegionCode()+'/'+soc+'?coarse=true',
                                                parseSkillsShortageData,'Cannot Access Skills Shortage LMI Data.');

    //Get Unemployment Data from LMI API
    apiService('http://api.lmiforall.org.uk/api/v1/lfs/unemployment?soc='+soc+'&minYear=2012&maxYear=2012',
                                                         parseUnemploymentData,'Cannot Access Unemployment LMI Data.');

    //Get Region Work Future Data from LMI API
    apiService('http://api.lmiforall.org.uk/api/v1/wf/predict/breakdown/region?soc='+soc+'&minYear=2014&maxYear=2020',
                                                    parseRegionWorkFutureData,'Cannot Access Work Futures LMI Data.');

    //Get Education Work Future Data from LMI API
    apiService('http://api.lmiforall.org.uk/api/v1/wf/predict/breakdown/qualification?soc='+soc+'&minYear=2013&maxYear=2020',
                                        parseEducationWorkFutureData,'Cannot Access Education Work Futures LMI Data.');

    //Get Education Work Future Data from LMI API
    apiService('http://api.lmiforall.org.uk/api/v1/o-net/soc2onet/'+soc,parseOnetData,'Cannot Access ONET LMI Data.');

    //Get Nestoria Data
    apiService('http://api.nestoria.co.uk/api?country=uk&pretty=1&action=metadata&place_name='+encodeURI(getRegionName())+
                                            '&encoding=json',parseNestoriaData,'Cannot Access Nestoria Data.');
}

function getStoredSocCode(){
    return this.socCode;
}

function setStoredSocCode(code){
    this.socCode = code;
}

//GRADUATION YEAR
//this is not in keeping with the logic of the
//application change
function listenDropdownGraduationChange(){
    $(".graduation-menu li a").click(function(){
        $(".graduation-year").text($(this).text());

        if(getStoredSocCode() != undefined){
            search(getStoredSocCode());
        }else{
            alert('Now set what job you would like to do after university.');
        }
    });
};

function getCurrentYear(){
    return 2014;
}

function getGraduationYear(){
    return parseInt($(".graduation-year").text());
}

//REGION MENU
function listenDropdownRegionChange(){
    $(".region-menu li a").click(function(){
        $(".region-display").text($(this).text());
        setRegionCode(calcRegionCode($(this).text()));

        if(getStoredSocCode() != undefined){
            search(getStoredSocCode());
        }else{
            alert('Now set what job you would like to do after university.');
        }
    });
};

//improve later
function calcRegionCode(value){
    var code = 1;//default is London

    switch(value){
        case 'London':
            code = 1;
            break;
        case 'North East (England)':
            code = 2;
            break;
        case 'North West (England)':
            code = 3;
            break;
        case 'Yorkshire & Humberside':
            code = 4;
            break;
        case 'East Midlands (England)':
            code = 5;
            break;
        case 'West Midlands (England)':
            code = 6;
            break;
        case 'East of England':
            code = 7;
            break;
        case 'South East (England)':
            code = 8;
            break;
        case 'South West (England)':
            code = 9;
            break;
        case 'Wales':
            code = 10;
            break;
        case 'Scotland':
            code = 11;
            break;
        case 'Northern Ireland':
            code = 12;
            break;
    }

    return code;
}

//Default Region is London which is a region code of 1
this.regionCode = 1;

function setRegionCode(code){
    this.regionCode = code;
}

function getRegionCode(){
    return this.regionCode;
}

function getRegionName(){
    console.log('Region Fullname : ' + $(".region-display").text());
    return $(".region-display").text();
}

//Click on search clears search box
function listenForClickInSearch(){
    $("#career-input").click(function(){
        var searchInput = $("#career-input").val();
        if(searchInput.length > 1){
            $("#career-input").val('');
        }
    });
}

function getExpenses(){

    if($("#cost-input").val() == ""){
        return 500;
    }else {
        return parseInt($("#cost-input").val());
    }
}

function calcUsersFutureExpenses(currentExpense, currentYear, graduationYear){

    var predictedInflation = avgRetailPriceIndex();
    var yearsAtUniversity = graduationYear - currentYear;
    var userFutureExpense = currentExpense;

    for(var i=0; i < yearsAtUniversity;i++){
        userFutureExpense += (currentExpense / 100) * predictedInflation;
    }

    ractive.set("userFutureExpenses", parseInt(userFutureExpense) );
}

function parseOnetData(json){
    var ONetCode = getOnetCode(json);

    apiService('http://api.lmiforall.org.uk/api/v1/o-net/skills/'+encodeURI(ONetCode),
                                          parseSkillsOfEmployedData,'Cannot Access Skills Of Employed ONET LMI Data.');
}

function parseSkillsOfEmployedData(json){

    var skillsDataFromOnet = getSkillsDataFromOnetJsonSorted(json);
    drawSkills(skillsDataFromOnet);
}

/*  If you get more time think about putting these in columns */
function drawSkills(skillsData){

    var fontSize=1.7;
    var FONT_REDUCTION=0.016;

    $('.skillsdata ul').remove();
    $('.skillsdata').append('<ul class="list-inline">');

    for(var j=0; j < skillsData.length;j++){
        fontSize -= FONT_REDUCTION;

        if(j == skillsData.length - 1){//Clean
            $('.skillsdata ul').append('<li style="font-size:'+fontSize+'em">'+skillsData[j].name+'.</li>');
        }else{
            $('.skillsdata ul').append('<li style="font-size:'+fontSize+'em">'+skillsData[j].name+',</li>');
        }
    }

    $('.skillsdata').append('</ul>');
}

function getSkillsDataFromOnetJsonSorted(json){

    var skills=[];

    for(var i=0; i < json.scales[0].skills.length; i++){

        var skill = new Object();
        skill.name = json.scales[0].skills[i].name;
        skill.value = json.scales[0].skills[i].value;

        skills.push(skill);
    }

    return skills.sort(function(a, b){return b.value - a.value});
}

//Assume first code is the correct one to give better UX
function getOnetCode(json){
    console.log("json.onetCodes[0].code" + json.onetCodes[0].code);
    return json.onetCodes[0].code;
}

function setYearsAtUniversity(startYear, finishYear){
    ractive.set('yearsAtUniversity', startYear - finishYear);
}

function parseExtendedJobData(json){

    ractive.set('jobTitle', json.title) ;
    ractive.set('qualificationsRequired', json.qualifications) ;
    ractive.set('jobDescription', json.description) ;
    ractive.set('jobTasks', json.tasks) ;
}

/**
 * The ESS reports what percentage of vacancies are hard to fill and how much of that is due to skills shortages.
 *
 * Use this to return the skills shortages within a given region
 *
 * WARNING : you need to do some calulations here around hard to fill jobs
 * and job shortges
 */
function parseSkillsShortageData(json){
    console.log('SKILLS SHORTAGES');

    ractive.set('percentSkillsShortages', parseInt(json.percentSSV));
    ractive.set('percentHardToFill', parseInt(json.percentHTF));
    ractive.set('percentHardToFillIsSkillsShortages', parseInt(json.percentHTFisSSV));
}

/**
 * The Labour Force Survey provides the LMI For All API's unemployment information. Note that unemployment is not
 * precisely tracked per occupation in the LFS, so the figures are somewhat fuzzy.
 *
 * NOTE : Here we can actaully get the unemployment by age!
 * Also by qualification, also by Female/Males
 */
function parseUnemploymentData(json){
    console.log('Unemployment Data : ' + JSON.stringify(json));
    ractive.set('unemploymentRate', parseInt(json.years[0].unemprate));
}

function parseEstimatedPay(json){
    setMoneyFutureData(json,getCurrentYear(),getGraduationYear());
}

/**
 * Generic JSON Service that uses AJAX to get an API, when
 * passed a URI. Returns the JSON to a callback function.
 *
 * @param uri
 * @param callback
 * @param errorText
 */
function apiService(uri,callback,errorText){
    $.ajax({
        type: 'GET',
        url: uri,
        async: false,
//        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            callback(json);
        },
        error: function(e) {
            console.log('Error : ' + errorText);
            console.log(e.message);
        }
    });
}

function parseService(json){
    console.log('Parsing Service');
    console.log(JSON.stringify(json));
}

apiService('http://api.lmiforall.org.uk/api/v1/soc/search?q=software',parseService)

const WEEKS_IN_YEAR=52;

function avgRetailPriceIndex(){

    var meanInflation=0;
    var totalInflation=0;

    var retailPriceIndex = [
        {
            "year":2012,
            "inflation":3.20
        },
        {
            "year":2011,
            "inflation":5.20
        },
        {
            "year":2010,
            "inflation":4.60
        },
        {
            "year":2009,
            "inflation":-0.5
        },
        {
            "year":2008,
            "inflation":4.0
        }

    ]

    for(var i=0; i < retailPriceIndex.length;i++){
        totalInflation += parseFloat(retailPriceIndex[i].inflation);
    }

    meanInflation = totalInflation/retailPriceIndex.length;

    console.log('averageRetailPriceIndex ' + totalInflation/retailPriceIndex.length );

    return meanInflation;
}

function numberWithCommaAtThousand(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function setMoneyFutureData(json,currentYear,graduationYear){

    var predictedInflation = avgRetailPriceIndex();
    var yearsAtUniversity = graduationYear - currentYear;
    const MONTHS_IN_YEAR = 12;

    var estimatedAverageSalaryWeeklyPay = parseInt(json.series[0].estpay);
    var estimatedAverageSalaryYearlyPay = estimatedAverageSalaryWeeklyPay * WEEKS_IN_YEAR;
    var easYearlyPayGraduationYear = estimatedAverageSalaryYearlyPay;

    for(var i=0; i < yearsAtUniversity;i++){
        easYearlyPayGraduationYear += (easYearlyPayGraduationYear / 100) * predictedInflation;
    }

    ractive.set('easYearlyPayGraduationYear', numberWithCommaAtThousand(parseInt(easYearlyPayGraduationYear)));
    setEstimatedPayYearlyGraduationYear(numberWithCommaAtThousand(parseInt(easYearlyPayGraduationYear)));

    ractive.set('estimatedPayWeekly', estimatedAverageSalaryWeeklyPay);
    ractive.set('estimatedPayMonthly', estimatedAverageSalaryWeeklyPay*4);


    setEstimatedPayMonthlyGraduationYear(parseInt(easYearlyPayGraduationYear/12));

    ractive.set('estimatedPayYearly', numberWithCommaAtThousand(estimatedAverageSalaryYearlyPay));
}

function setEstimatedPayYearlyGraduationYear(futureYearlyPay){
    this.estimatedFutureYearlyPay = futureYearlyPay;
}

function getEstimatedPayYearlyGraduationYear(){
    return this.estimatedFutureYearlyPay;
}

function setEstimatedPayMonthlyGraduationYear(futureMonthlyPay){

    console.log('NOW WE ARE SETTING THE ESTIMATED PAY MONTHLY');

    console.log('Estimate Future Pay monthly' + futureMonthlyPay);
    ractive.set('estimatedFuturePayMonthly', futureMonthlyPay);
    this.estimatedFuturePayMonthly = futureMonthlyPay;
}

function getEstimatedPayMonthlyGraduationYear(){
    console.log('NOW WE ARE GETTING THE ESTIMATED PAY MONTHLY');
    return this.estimatedFuturePayMonthly;
}

function parseRegionWorkFutureData(json){

    var region = getRegionCode();
    drawChart(getJobFutureInRegionChartJSFormatted(json,region));
    calcJobPercentageChangeRegion(json, getCurrentYear(), getGraduationYear(),region);
}

function getWorkFutureChartRange(data){

    var workFutureChartRange=[];
    workFutureChartRange.push(parseInt(data[0].employment));
    workFutureChartRange.push(parseInt(data[data.length - 1].employment));

    return workFutureChartRange.sort(function(a, b){return a - b});
}

function parseNestoriaData(json){
    extractNestoriaData(json,"2011_m10");
}

function extractNestoriaData(json,nestoriaDataTime) {

    const BUY = 'buy';
    const RENT = 'rent';
    var avgRentPrices=[];
    var avgBuyPrices=[];
    var metadata,price,month,beds,listingType;

    for(var i=0;i<6;i++){
        metadata = json.response.metadata[i];
        price = parseInt(metadata.data["2014_m1"].avg_price);
        month = metadata.data["2014_m1"].month;
        beds = metadata.num_beds;
        listingType = metadata.listing_type;

        if(listingType == RENT){
            avgRentPrices.push({"beds":beds,"price":price,"month":month,"type":listingType});
        }else if(listingType == BUY){
            avgBuyPrices.push({"beds":beds,"price":price,"month":month,"type":listingType});
        }
    }

    //just want to make sure it's returned in the correct order as it's come from
    //a json feed.
    avgRentPrices.sort(function(a, b){return a.beds - b.beds});
    avgBuyPrices.sort(function(a, b){return a.beds - b.beds});

    createFutureRentChart(avgRentPrices, getCurrentYear(), getGraduationYear());
    createCurrentRentChart(avgRentPrices);

    createCurrentPurchaseChart(avgBuyPrices);
    createFuturePurchaseChart(avgBuyPrices, getCurrentYear(), getGraduationYear());

    console.log("Average Rent Prices from Nestoria : ");
    console.log(avgRentPrices);
    console.log("Average Buy Prices from Nestoria : ");
    console.log(avgBuyPrices);

    ractive.set("rentPrices", avgRentPrices);
    ractive.set("buyPrices", avgBuyPrices);



//    calcSavingPerMonth(avgRentPrices[0].price);
}

function calcSavingPerMonth(rentFor1BedFlat){

    console.log('rentFor1BedFlat' + rentFor1BedFlat);

    var userExpensePerMonth = ractive.get('userFutureExpenses');
    var flatPerMonth = rentFor1BedFlat;
//    var estimatedPayMonthly = ractive.get('estimatedPayMonthly');
    var estimatedPayMonthly = getEstimatedPayMonthlyGraduationYear();


    console.log('parseInt(estimatedPayMonthly)' + estimatedPayMonthly);
    console.log('parseInt(userExpensePerMonth)' + parseInt(userExpensePerMonth));
    console.log('flatPerMonth' + flatPerMonth);

    var totalSavingPerMonth = estimatedPayMonthly - (parseInt(userExpensePerMonth) + flatPerMonth);

    console.log('totalSavingPerMonth' + totalSavingPerMonth);

    ractive.set("userSavingPerMonth", totalSavingPerMonth);

    setPrepareSavingsChart(totalSavingPerMonth);
    setEstimatedSavingsPerMonth(totalSavingPerMonth);

}

function setEstimatedSavingsPerMonth(savingsPerMonth){
    this.estimatedSavingsPerMonth = savingsPerMonth;
}

function getEstimatedSavingsPerMonth(){
    return this.estimatedSavingsPerMonth;
}

function setPrepareSavingsChart(totalSavingPerMonth){

    //so let's run through each year and the saving from that year

    var yearsSavingsToShow = 20;
    var yearlySavings = totalSavingPerMonth;
    var savingTime=[];
    var year = 0;
    console.log('year' + year);


    for(var i=0;i < yearsSavingsToShow;i++){

        savingTime.push({year:year,savings:yearlySavings * i});
        year++;
    }

    drawSavingsOverTimeChart(savingTime);
}

function createCurrentRentChart(data){

    var priceData = [];
    var endValue = 2500;//data[data.length - 1].price;

    for(var i=0;i<data.length;i++){
        priceData.push(parseInt(data[i].price));
    }

    chartContainerCurrentRent(priceData, endValue);
}

function createFutureRentChart(data,currentYear, graduationYear){

    var averagePriceIncrease = 7;
    var priceData = [];
    var endValue = 2500;//(data[data.length - 1].price) * averagePriceIncrease;
    var yearDifference = graduationYear - currentYear;
    var priceForYear =0;

    for(var i=0;i<data.length;i++){
        priceForYear = parseInt(data[i].price);

        for(var j=0;j<yearDifference;j++){
            priceForYear += (parseInt(data[i].price) / 100) * averagePriceIncrease;
        }
        priceData.push(priceForYear);
    }

    chartContainerFutureRent(priceData, endValue);
    ractive.set("futureRentPriceData", priceData);
    calcSavingPerMonth(parseInt(priceData[0]));
}

function createCurrentPurchaseChart(data){

    var priceData = [];
    var endValue = 700000;//data[data.length - 1].price;

    for(var i=0;i<data.length;i++){
        priceData.push(parseInt(data[i].price));
    }

    chartContainerCurrentPurchasePrice(priceData, endValue);
}

function createFuturePurchaseChart(data,currentYear, graduationYear){

    var averagePriceIncrease = 7;
    var priceData = [];
    var endValue = 700000;//(data[data.length - 1].price) * averagePriceIncrease;
    var yearDifference = graduationYear - currentYear;
    var priceForYear =0;

    for(var i=0;i<data.length;i++){
        priceForYear = parseInt(data[i].price);

        for(var j=0;j<yearDifference;j++){
            priceForYear += (parseInt(data[i].price) / 100) * averagePriceIncrease;
            console.log('Purchase Price in year : '+i+ ' : ' + priceForYear);
        }
        priceData.push(priceForYear);
    }

    calculateHowLongToDeposit(priceData, getEstimatedSavingsPerMonth());

    chartContainerFuturePurchasePrice(priceData, endValue);
}


function getJobFutureInRegionChartJSFormatted(json,region){

    var year=[];
    var predictedNumberEmployed=[];

    for(var index = 0; index < json.predictedEmployment.length; index++){
        year.push(parseInt(json.predictedEmployment[index].year));
        for(var j=0;j<json.predictedEmployment[index].breakdown.length; j++){

            if(parseInt(json.predictedEmployment[index].breakdown[j].code) == region){
                predictedNumberEmployed.push(parseInt(json.predictedEmployment[index].breakdown[j].employment))
                break;
            }
        }
    }

    var data = {
        labels : year,
        datasets : [
            {
                fillColor : "#98002F",
                strokeColor : "#98002F",
                pointColor : "#98002F",
                pointStrokeColor : "#98002F",
                data : predictedNumberEmployed
            },
        ]
    }

    return data;
}


//FOR DX CHART REMOVED FOR NOW
function getJobFutureInRegionDXChartFormatted(json,region){

    var year=[];
    var predictedNumberEmployed=[];

    var employmentByYear;
    var employmentByYearData=[];


    for(var index = 0; index < json.predictedEmployment.length; index++){

        employmentByYear = new Object()

        employmentByYear.year = parseInt(json.predictedEmployment[index].year);
        year.push(parseInt(json.predictedEmployment[index].year));


        for(var j=0;j<json.predictedEmployment[index].breakdown.length; j++){

            if(parseInt(json.predictedEmployment[index].breakdown[j].code) == 1){

                employmentByYear.employment = parseInt(json.predictedEmployment[index].breakdown[j].employment);
                predictedNumberEmployed.push(parseInt(json.predictedEmployment[index].breakdown[j].employment));
                break;
            }
        }

        employmentByYearData.push(employmentByYear);
    }

    console.log(employmentByYearData);
    return employmentByYearData;
}

function parseEducationWorkFutureData(json){
    var futureEducationDataForEmployed = [];
    var formattedDatasetForEmployedChart = [];

    futureEducationDataForEmployed = getFutureEducationDataForEmployed(json,getGraduationYear());
    //formattedDatasetForEmployedChart = createFormattedDataForEducationChart(futureEducationDataForEmployed);
    formattedDatasetForEmployedChart = createFormattedDataForEducationDXChart(futureEducationDataForEmployed);

    chartContainerDegreeEducated(formattedDatasetForEmployedChart);
    //drawEducationFutureChart(formattedDatasetForEmployedChart);
    //drawEducationFutureKey(futureEducationDataForEmployed, getEmployedGraduationYear());
}

function calcJobPercentageChangeRegion(json, currentYear, graduationYear, region){
    var employedCurrently=0;
    var employedGraduationYear=0;

    for(var index = 0; index < json.predictedEmployment.length; index++){

        //Find Employed from Current Year
        if(parseInt(json.predictedEmployment[index].year) == currentYear){
            for(var j=0;j<json.predictedEmployment[index].breakdown.length; j++){
                if(parseInt(json.predictedEmployment[index].breakdown[j].code) == region){
                    employedCurrently = parseInt(json.predictedEmployment[index].breakdown[j].employment);
                    break;
                }
            }
        }

        //Find Employed from Graduation Year
        if(parseInt(json.predictedEmployment[index].year) == graduationYear){
            for(var j=0;j<json.predictedEmployment[index].breakdown.length; j++){
                if(parseInt(json.predictedEmployment[index].breakdown[j].code) == region){
                    employedGraduationYear = parseInt(json.predictedEmployment[index].breakdown[j].employment);
                    break;
                }
            }
        }
    }

    setJobPercentageChange(calcPercentageChange(employedCurrently, employedGraduationYear));
    setJobIncreaseOrDecrease(calcJobIncreaseOrDecrease(employedCurrently, employedGraduationYear));

    var changeInNumberOfEmployed = employedGraduationYear - employedCurrently;

    ractive.set("changeInNumberOfEmployed", changeInNumberOfEmployed);
    ractive.set("employedCurrently", employedCurrently);
    ractive.set("employedGraduationYear", employedGraduationYear);
}

function calcPercentageChange(employedCurrently,employedGraduationYear){
    return ((employedGraduationYear-employedCurrently)/employedCurrently)*100;
}

function calcEmployedEducationPercentage(employed,totalEmployed){
    return (employed/totalEmployed)*100;
}

function calcJobIncreaseOrDecrease(employedCurrently,employedGraduationYear){
    return (employedCurrently <= employedGraduationYear)? "increased" : "decreased";
}

function setJobIncreaseOrDecrease(jobIncreaseOrDecreased){
    ractive.set("jobIncreaseOrDecreased", jobIncreaseOrDecreased);
    ractive.set("jobIncreaseOrDecrease", jobIncreaseOrDecreased.substring(0, jobIncreaseOrDecreased.length - 1));
}

function setJobPercentageChange(percentage){
    ractive.set("jobPercentageChange", Math.round(percentage));
}

this.hasAnimated = false;

//Only animated once at the start
function scrollToStart(){
    if(!hasAnimated){
        $('html,body').animate({
            scrollTop: $("#container").offset().top
        }, 2000);

        hasAnimated = true;
    }
}

/**
 * Associated Levels with Codes
 *
 * Code 1 - NQF 8 - Doctorate
 * Code 2 - NQF 7 - Masters Degree
 * Code 3 - NQF 6 - First Degree
 * Code 4 - NQF 5 - Foundation Degree
 * Code 5 - NQF 4 - HNC or Equivalent
 * Code 6 - NQF 3 - A-Level or Equivalent
 * Code 7 - NQF 2 -GCSE grade A-C or Equivalent
 * Code 8 - NQF 1 - GCSE grade D-E or Equivalent
 * Code 9 - No Qualification - Entry Level Qualification
 * Code -9 - Missing
 * Code -8 - Missing
 *
 * @param json
 * @param year
 * @returns {Array}
 */
function getFutureEducationDataForEmployed(json, year){ //rename

    var predictedEmployment = json.predictedEmployment;
    var predictedEmployeeEducations = [];
    var predictedEmployeeEducation;
    var totalEmployed = 0;//see if you can get this from elsewhere

    for(var i=0;i< predictedEmployment.length;i++){

        if(predictedEmployment[i].year == year){

            for(var breakdownIndex=0; breakdownIndex < predictedEmployment[i].breakdown.length; breakdownIndex++){

                var predictedEducationJSON = predictedEmployment[i].breakdown[breakdownIndex];

                predictedEmployeeEducation = new Object();
                predictedEmployeeEducation.code = predictedEducationJSON.code;
                predictedEmployeeEducation.name = predictedEducationJSON.name;
                predictedEmployeeEducation.employment = predictedEducationJSON.employment;
                predictedEmployeeEducation.educationLevel = getEducationLevelForCode(predictedEducationJSON.code);
                predictedEmployeeEducation.color = getColorForCode(predictedEducationJSON.code);

                predictedEmployeeEducations.push(predictedEmployeeEducation);
                totalEmployed += parseInt(predictedEducationJSON.employment);
            }

            break;
        }
    }

    console.log('totalEmployed' + totalEmployed);
    setEmployedGraduationYear(totalEmployed);  //THIS SHOULD BE RETURNED VIA THE METHOD AND NOT SET ANOTHER ONE
    //as need to abstract it out
    /* Return a Sorted Array of Predicted Employment Education Data */
    return predictedEmployeeEducations.sort(function(a, b){return a.code - b.code});
};

function setEmployedGraduationYear(employed){
    this.employedGraduationYearForEducation = employed;
}

function getEmployedGraduationYear(){
    return this.employedGraduationYearForEducation;
}

function calculateHowLongToDeposit(propertyPrices, savingsPerMonth){

    const FIVE_PERCENT_HOME_BUYERS_DEPOSIT=5;
    var homeBuyersDeposits=[];
    var moneyNeededForDeposit = 0;
    var timeToSaveForDeposit=0;

    console.log(propertyPrices);
    console.log(savingsPerMonth);

    for(var i=0;i<propertyPrices.length;i++){
        moneyNeededForDeposit = parseInt(propertyPrices[i]/100) * FIVE_PERCENT_HOME_BUYERS_DEPOSIT;
        timeToSaveForDeposit = moneyNeededForDeposit/(savingsPerMonth);
        homeBuyersDeposits.push(Math.round(timeToSaveForDeposit));
    }

    ractive.set("homeBuyersDeposits", homeBuyersDeposits)
}

function createFormattedDataForEducationChart(futureEducationData){

    console.log('futureEducationData' + JSON.stringify(futureEducationData));

    var formattedEducationChartData = [];
    for(var j=0; j < futureEducationData.length;j++){
        formattedEducationChartData.push({value:futureEducationData[j].employment, color:futureEducationData[j].color});
    }
    return formattedEducationChartData;
}

function createFormattedDataForEducationDXChart(futureEducationData){

    var formattedEducationChartData = [];
    for(var j=0; j < futureEducationData.length;j++){
        formattedEducationChartData.push({val:parseInt(futureEducationData[j].employment), educationLevel:futureEducationData[j].educationLevel});
    }
    return formattedEducationChartData;
}

function drawEducationFutureKey(futureEducationData, employedGraduationYear){

    var percentageEmployedAtEducationLevel;

    $('.job-item-education-chart-key ul').remove();

    $('.job-item-education-chart-key').append('<ul>');

    for(var j=0; j < futureEducationData.length;j++){
        percentageEmployedAtEducationLevel = parseInt(calcEmployedEducationPercentage(futureEducationData[j].employment, employedGraduationYear));
        $('.job-item-education-chart-key ul').append('<li style="color:'+futureEducationData[j].color+'">'+futureEducationData[j].educationLevel+ ' - '+percentageEmployedAtEducationLevel+'%</li>');
    }

    $('.job-item-education-chart-key').append('</ul>');
}

/**
 * Gets the education level ie. Doctorate for a code from working futures.
 * @param code
 */
function getEducationLevelForCode(code){
    switch(code){
        case 1:
            return "Doctorate"
            break;
        case 2:
            return "Masters Degree"
            break;
        case 3:
            return "First Degree"
            break;
        case 4:
            return "Foundation Degree"
            break;
        case 5:
            return "HNC or Equivalent"
            break;
        case 6:
            return "A-Level or Equivalent"
            break;
        case 7:
            return "GCSE grade A-C or Equivalent"
            break;
        case 8:
            return "GCSE grade D-E or Equivalent"
            break;
        case 9:
            return "No Qualification"
            break;
        case -9:
            return "Missing"
            break;
        case -8:
            return "Missing"
            break;
        default:
            return "Education Level Unknown";
    }
}

/**
 * Find a neater way of doing this and linking it to the CSS
 * @param code
 * @returns {string}
 */
function getColorForCode(code){
    switch(code){
        case 1:
            return "#6AF5FD"
            break;
        case 2:
            return "#88BBBE"
            break;
        case 3:
            return "#4AABB1"
            break;
        case 4:
            return "#B6F9FD"
            break;
        case 5:
            return "#357A7E"
            break;
        case 6:
            return "#ffcc00"
            break;
        case 7:
            return "#990000"
            break;
        case 8:
            return "#643516"
            break;
        case 9:
            return "#B1734A"
            break;
        case -9:
            return "#E45A49"
            break;
        case -8:
            return "#E45A49"
            break;
        default:
            return "#E45A49";
    }
}


function createCareerFutureDataForChart(json){

    var year=[];
    var predictedNumberEmployed=[];

    for(var i=0;i<json.predictedEmployment.length;i++){
        year.push(json.predictedEmployment[i].year);
        predictedNumberEmployed.push(parseInt(json.predictedEmployment[i].employment));
    }

    var data = {
        labels : year,
        datasets : [
            {
//                fillColor : "rgba(255,204,0,0.45)",
                fillColor : "#CE0043",
                strokeColor : "#CE0043",
                pointColor : "#CE0043",
                pointStrokeColor : "#CE0043",
                data : predictedNumberEmployed
            },
        ]
    }

    return data;
}


function drawEducationFutureChart(data){

    this.eductionFutureData = data;

    $('#education-chart').remove();
    $('.education-chart-container').append('<canvas id="education-chart"></canvas>');

    $('#education-chart').attr('width', jQuery(".education-chart-container").width());
    $('#education-chart').attr('height', (jQuery(".education-chart-container").height() * 1.8));

    var ctx = $('#education-chart').get(0).getContext("2d");

    var options = {
        animateRotate : true,
    }

    new Chart(ctx).Pie(data,options);             //watch out here for memory issues
}

//function drawSkillChart(data){
//
//    this.skillData = data;
//
//    $('#skill-chart').remove();
//    $('.skill-chart-container').append('<canvas id="skill-chart"></canvas>');
//
//    $('#skill-chart').attr('width', jQuery(".skill-chart-container").width());
//    $('#skill-chart').attr('height', (jQuery(".skill-chart-container").height() * 1.8));
//
//    var ctx = $('#skill-chart').get(0).getContext("2d");
//
//    var options = {
////        animateRotate : true,
//    }
//
//    new Chart(ctx).Radar(data,options);             //watch out here for memory issues
//}

function drawChart(data){

    this.data = data;

    $('#career-future-chart').remove();
    $('.career-future-chart-container').append('<canvas id="career-future-chart"></canvas>');

    $('#career-future-chart').attr('width', jQuery(".career-future-chart-container").width());
    $('#career-future-chart').attr('height', (jQuery(".career-future-chart-container").height() * 4.2));

    var ctx = $('#career-future-chart').get(0).getContext("2d");

    var options = {
        bezierCurve : false
    }

    new Chart(ctx).Bar(data,options);             //watch out here for memory issues
}

function resizeChart(){

    $('#career-future-chart').remove();
    $('.career-future-chart-container').append('<canvas id="career-future-chart"></canvas>');
    var ctx = $('#career-future-chart').get(0).getContext("2d");

    var options = {
        bezierCurve : false
    }

    $('#career-future-chart').attr('width', jQuery(".career-future-chart-container").width());
    $('#career-future-chart').attr('height', (jQuery(".career-future-chart-container").height()*4.2));
    new Chart(ctx).Bar(this.data,options);
}


//function resizeEducationChart(){
//
//    $('#education-chart').remove();
//    $('.education-chart-container').append('<canvas id="education-chart"></canvas>');
//    var ctx = $('#education-chart').get(0).getContext("2d");
//
//    $('#education-chart').attr('width', jQuery(".education-chart-container").width());
//    $('#education-chart').attr('height', (jQuery(".education-chart-container").height()*1.8));
//    new Chart(ctx).Pie(this.eductionFutureData);
//}

//function drawSavingsChart(){
//
////    var palette = ['#9BCE7d', '#72Ac93', '#699E87', '#BD0102', '#98002F', '#fa6b63'];
//    var palette = ['#796844', '#F8DA98', '#B64B4B','#365F4E'];
//    var dataSource = [
//        {region: "Council Tax, Gas, Water, Electricity", val: 150},
//        {region: "Food", val: 200},
//        {region: "Rent", val: 600},
//        {region: "Entertainment", val: 200},
//        {region: "Travel", val: 150},
//        {region: "Savings", val: 500}
//    ];
//
//    $("#chartContainer").dxPieChart({
//        dataSource: dataSource,
////        title: "The Population of Continents and Regions",
//        tooltip: {
//            enabled: true,
//            format:"millions",
//            percentPrecision: 2,
//            customizeText: function() {
//
//                if(this.argumentText == "Savings"){
//                    return "£" + this.originalValue + " saved per month.";
//                }
//                else{
//                    return "£" + this.originalValue + " spent on " +this.argumentText+" per month.";
//                }
//            }
//        },
//        legend: {
//            enabled:false,
//            orientation: "horizontal",
//            itemTextPosition: "right",
//            horizontalAlignment: "center",
//            verticalAlignment: "bottom",
//            rowCount: 2
//        },
//        palette: palette,
//        series: [{
//            type: "pie",
//            argumentField: "region",
//            label: {
//                visible: true,
//                font: {
//                    size: 18
//                },
//                format: "millions",
//                connector: {
//                    visible: true
//                },
//                position: "columns",
//                customizeText: function(arg) {
//                    if(arg.argumentText == "Savings"){
//                        return arg.percentText + " of Estimate Avg. Salary Saved!";
//                    }else{
//                        return arg.percentText + " of Salary spent on " + arg.argumentText;
//                    }
//                }
//            }
//        }]
//    });
//}

function drawSavingsOverTimeChart(savingsDataSource){

    var palette = ['#BD0102'];
    $("#chartContainerSavingsOverTime").dxChart({
        dataSource: savingsDataSource,
        commonSeriesSettings: {
            argumentField: "year"
        },
        commonAxisSettings: {
            grid: {
                visible: true
            }
        },
        palette:palette,
        series: [
            { valueField: "savings", name: "Savings" }
        ],
        tooltip:{
            enabled: true,
            customizeText: function() {
                return "£" + this.originalValue + " saved.";
            }
        },
        argumentAxis: {
            label: {
                customizeText: function () {
                    return this.value;
                }
            },
            title: 'Time (Months)'
        },
        valueAxis: {
            label: {
                customizeText: function () {
                    return this.value;
                }
            },
            title: 'Savings (£)'
        },
        commonPaneSettings: {
            border:{
                visible: true,
                bottom: false
            }
        }
    });
}

function chartContainerCurrentRent(data,endValue){
    var palette = ['#9BCE7d', '#72Ac93', '#699E87'];

    $('#chartContainerCurrentRent').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values: data,
        palette:palette,
        label: {
            indent: 30,
            format: 'fixedPoint',
            precision: 1,
            customizeText: function (arg) {
                return '£' + arg.valueText;
            }
        },
        title: {
            font: {
                size: 28
            }
        }
    });
}

function chartContainerFutureRent(data,endValue){
    var palette = ['#efefef', '#F6E2AB', '#98002f'];

    $('#chartContainerFutureRent').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values:data,
        palette:palette,
        label: {
            indent: 30,
            format: 'fixedPoint',
            precision: 1,
            customizeText: function (arg) {
                return '£' + arg.valueText;
            }
        },
        title: {
            font: {
                size: 28
            }
        }
    });
}


function chartContainerCurrentPurchasePrice(data,endValue){
    var palette = ['#9BCE7d', '#72Ac93', '#699E87'];

    $('#chartContainerCurrentPurchasePrice').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values: data,
        palette: palette,
        label: {
            indent: 30,
            format: 'fixedPoint',
            precision: 1,
            customizeText: function (arg) {
                return '£' + arg.valueText;
            }
        },
        title: {
            font: {
                size: 28
            }
        }
    });
}

function chartContainerFuturePurchasePrice(data,endValue){

    var palette = ['#efefef', '#F6E2AB', '#98002f'];

    $('#chartContainerFuturePurchasePrice').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values:data,
        palette:palette,
        label: {
            indent: 30,
            format: 'fixedPoint',
            precision: 1,
            customizeText: function (arg) {
                return '£' + arg.valueText;
            }
        },
        title: {
            font: {
                size: 28
            }
        }
    });
}

function chartContainerCurrentCostOfLiving(){
    var palette = ['#9BCE7d', '#72Ac93', '#699E87'];

    var dataSource = [
        {region: "Council Tax, Gas, Water, Electricity", val: 150},
        {region: "Food", val: 200},
        {region: "Rent", val: 600},
        {region: "Entertainment", val: 200},
        {region: "Travel", val: 150},
        {region: "Savings", val: 500}
    ];

    $("#chartContainerCurrentCostOfLiving").dxPieChart({
        dataSource: dataSource,
//        title: "The Population of Continents and Regions",
        tooltip: {
            enabled: true,
            format:"millions",
            percentPrecision: 2,
            customizeText: function() {

                if(this.argumentText == "Savings"){
                    return "£" + this.originalValue + " saved per month.";
                }
                else{
                    return "£" + this.originalValue + " spent on " +this.argumentText+" per month.";
                }
            }
        },
        legend: {
            enabled:false,
            orientation: "horizontal",
            itemTextPosition: "right",
            horizontalAlignment: "center",
            verticalAlignment: "bottom",
            rowCount: 2
        },
        palette: palette,
        series: [{
            type: "pie",
            argumentField: "region",
            label: {
                visible: true,
                font: {
                    size: 14
                },
                format: "millions",
                connector: {
                    visible: true
                },
                position: "columns",
                customizeText: function(arg) {
                    return "£" + arg.originalValue;
                }
            }
        }]
    });
}

function chartContainerFutureCostOfLiving(){
    var palette = ['#efefef', '#F6E2AB', '#98002f','#d5d5d5'];

    var dataSource = [
        {region: "Council Tax, Gas, Water, Electricity", val: 150},
        {region: "Food", val: 200},
        {region: "Rent", val: 600},
        {region: "Entertainment", val: 200},
        {region: "Travel", val: 150},
        {region: "Savings", val: 500}
    ];

    $("#chartContainerFutureCostOfLiving").dxPieChart({
        dataSource: dataSource,
//        title: "The Population of Continents and Regions",
        tooltip: {
            enabled: true,
            format:"millions",
            percentPrecision: 2,
            customizeText: function() {

                if(this.argumentText == "Savings"){
                    return "£" + this.originalValue + " saved per month.";
                }
                else{
                    return "£" + this.originalValue + " spent on " +this.argumentText+" per month.";
                }
            }
        },
        legend: {
            enabled:false,
            orientation: "horizontal",
            itemTextPosition: "right",
            horizontalAlignment: "center",
            verticalAlignment: "bottom",
            rowCount: 2
        },
        palette: palette,
        series: [{
            type: "pie",
            argumentField: "region",
            label: {
                visible: true,
                font: {
                    size: 14
                },
                format: "millions",
                connector: {
                    visible: true
                },
                position: "columns",
                customizeText: function(arg) {
                    return "£" + arg.originalValue;
                }
            }
        }]
    });
}

function chartContainerDegreeEducated(chartData){
    var palette = ['#9BCE7d', '#72Ac93', '#699E87', '#BD0102', '#98002F', '#fa6b63'];

    $("#chartContainerDegreeEducated").dxPieChart({
        dataSource: chartData,
        tooltip: {
            enabled: true,
            format:"millions",
            percentPrecision: 2,
            customizeText: function() {
                return this.percentText + " ("+ this.originalValue + " Jobs) in this role are filled by people who's highest education level is a " + this.originalArgument +".";
            }
        },
        legend: {
            enabled:false,
            orientation: "horizontal",
            itemTextPosition: "right",
            horizontalAlignment: "center",
            verticalAlignment: "bottom",
            rowCount: 2
        },
        palette: palette,
        series: [{
            type: "pie",
            argumentField: "educationLevel",
            label: {
                visible: true,
                font: {
                    size: 14
                },
                format: "millions",
                connector: {
                    visible: true
                },
                position: "columns",
                customizeText: function(arg) {
                    return this.percentText + this.originalArgument;
                }
            }
        }]
    });
}

function chartContainerWorkFuture(dataSource,startValue,endValue){
    var palette = ['#9BCE7d', '#72Ac93', '#699E87', '#BD0102', '#98002F', '#fa6b63'];

    console.log('startValue' + startValue);
    console.log('endValue' + endValue);

    $("#chartContainerWorkFuture").dxChart({
        startValue: startValue,
        endValue: endValue,
        dataSource: dataSource,
        series: {
            argumentField: "year",
            valueField: "employment",
            name: "Workers Employed",
            type: "bar",
            color: '#98002F'
        },
        legend: {
            orientation: "horizontal",
            itemTextPosition: "right",
            horizontalAlignment: "center",
            verticalAlignment: "bottom"
        },
        argumentAxis: {
            title: '#Years at University'
        },
        valueAxis: {
            title: '#Jobs Available'
        }

    });
}

$(window).resize(resizeChart);

listenDropdownGraduationChange();
listenDropdownRegionChange();
chartContainerFutureCostOfLiving();
chartContainerCurrentCostOfLiving();

listenForClickInSearch();