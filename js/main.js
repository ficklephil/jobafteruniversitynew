var jobMatches = [];

//NAME SPACING NEEDED
//USE LONDON RENTS FROM http://www.voa.gov.uk/

var ractive = new Ractive({
    el:'container',
    template:'#myTemplate',
    data: {greeting:'hello',recipient:'sdsds',estimatedPayWeekly:0,estimatedPayYearly:0,easYearlyPayGraduationYear:0,jobTitle:'Job Title Holder',jobDescription:'Job Description',jobTasks:'Job Tasks',
        qualificationsRequired:'Qualifications Holder',workFutureJobs:2323,jobs:jobMatches,
        percentSkillsShortages:20,percentHardToFill:20,percentHardToFillIsSkillsShortages:21,unemploymentRate:6,
        yearsAtUniversity:0,graduationYear:0,jobPercentageChange:0,employedCurrently:0,employedGraduationYear:0,jobIncreaseOrDecreased:'no data',jobIncreaseOrDecrease:'no data',changeInNumberOfEmployed:0,rentPrices:[],buyPrices:[]}
});


//this is not in keeping with the logic of the
//application change

function listenDropdownGraduationChange(){
    $(".graduation-menu li a").click(function(){
        $(".graduation-year").text($(this).text());
    });
};

$(function() {
    var availableTags = [
        "2014",
        "2015",
        "2016",
        "2017",
        "2018",
        "2019",
        "2020"
    ];
    $( "#graduation-input" ).autocomplete({
        source: availableTags,
        select:function( event, ui){
            console.log('Soc code of selected item is ' + $("#graduation-input").val());
        }
    });
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
    delay: 200,
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

        //think about putting work futures in here when finished.
        //getWorkFuture(soc);
    }
});

function search(soc){

    getExtendedJobInfomation(soc);
    getSkillsShortages(soc,1);
    getUnemployment(soc);

//    getCareerWorkFuture(soc);
    getRegionWorkFuture(soc);
    getEductionWorkFuture(soc);

    getEstimatedPay(soc);

    scrollToStart();

    setYearsAtUniversity(getGraduationYear(), getCurrentYear());
    ractive.set("graduationYear", getGraduationYear());

    getOnet(soc);
}

function getOnet(soc){  //remove if not used
    getSocToOnet(soc);
}

function getSocToOnet(soc){

    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/o-net/soc2onet/'+soc,
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {

            var ONetCode = getOnetCode(json);
            getSkillsOfEmployed(ONetCode);
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
        }
    });
}

function getSkillsOfEmployed(ONetCode){
    console.log('ONet Code' + ONetCode);

    var skillsDataFromOnet=[];

    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/o-net/skills/'+encodeURI(ONetCode),
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            var skillsDataFromOnet = getSkillsDataFromOnetJsonSorted(json);
            drawSkills(skillsDataFromOnet);



            console.log('skills' + JSON.stringify(skillsDataFromOnet));
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON Onet');
        }
    });
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

function getSkillsDataFromOnetJson(json){

    var skillNames=["Eating","Drinking","Sleeping","Designing","Coding"];
    var skillValues=[];
    var name ="hello";

//    for(var i=0; i < json.scales[0].skills.length;i++){
    for(var i=0; i < 1;i++){

//        var obj = new Object();
//        obj.name = String(json.scales[0].skills[i].name);

//        var name = JSON.stringify(json.scales[0].skills[i].name); //SO IT DOES't Like the JSon Name

        console.log(JSON.stringify(json.scales[0].skills[i].name));

        name +=  JSON.stringify(json.scales[0].skills[i].name);

        console.log('json.scales[0].skills[i].name' + JSON.stringify(json.scales[0].skills[i].name));
        console.log('json.scales[0].skills[i].value' + json.scales[0].skills[i].value);

        skillNames.push(name);

//        skillNames.push(json.scales[0].skills[i].name);
        skillValues.push(json.scales[0].skills[i].value);
    }

    console.log('skillNames' + skillNames);

//    skillNames = ["Eating","Drinking","Sleeping","Designing","Coding"]

    var data = {
        labels : skillNames,
        datasets : [
            {
                fillColor : "rgba(151,187,205,0.5)",
                strokeColor : "rgba(151,187,205,1)",
                pointColor : "rgba(151,187,205,1)",
                pointStrokeColor : "#fff",
                data : [3,4,3,3,4]
            }
        ]
    }

    return data;
}

//Assume first code is the correct one to give better UX
function getOnetCode(json){
    console.log("json.onetCodes[0].code" + json.onetCodes[0].code);
    return json.onetCodes[0].code;
}

function setYearsAtUniversity(startYear, finishYear){
    ractive.set('yearsAtUniversity', startYear - finishYear);
}

function getCurrentYear(){
    return 2014;
}

function getGraduationYear(){
    console.log($(".graduation-year").text());
    return parseInt($(".graduation-year").text());
}

function searchForJob(searchInput){
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/soc/search?q='+searchInput,
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            for(var jobIndex=0;jobIndex < json.length; jobIndex++){
                jobMatches.push({name:json[jobIndex].title.toString(), soc:json[jobIndex].soc})
            }
        },
        error: function(e) {
            console.log(e.message);
            alert('Unable to get back searches for jobs');
        }
    });
}

function searchJobData(){
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/soc/search?q=science',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            console.log(JSON.stringify(json));
//                       alert('I have JSON');
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
        }
    });
}

function getExtendedJobInfomation(soc){
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/soc/code/'+soc,
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            console.log('Extended Soc info : ' + JSON.stringify(json));

            console.log('Job title' + json.title);
            console.log('qualificationsRequired' + json.title);

            ractive.set('jobTitle', json.title) ;
            ractive.set('qualificationsRequired', json.qualifications) ;
            ractive.set('jobDescription', json.description) ;
            ractive.set('jobTasks', json.tasks) ;

//                       alert('I have JSON');
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
        }
    });
}

/**
 * The ESS reports what percentage of vacancies are hard to fill and how much of that is due to skills shortages.
 *
 * Use this to return the skills shortages within a given region
 *
 * WARNING : Region of London hardcoded here for now.
 * WARNING : you need to do some calulations here around hard to fill jobs
 * and job shortges
 * @param soc
 */

function getSkillsShortages(soc,region){
    console.log('getSkillsShortages' + soc + region);

    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/ess/region/'+region+'/'+soc+'?coarse=true',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            console.log('ESS Data on Skills Shortages : ' + JSON.stringify(json));

            ractive.set('percentSkillsShortages', parseInt(json.percentSSV));
            ractive.set('percentHardToFill', parseInt(json.percentHTF));
            ractive.set('percentHardToFillIsSkillsShortages', parseInt(json.percentHTFisSSV));
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON from Skills shortages');
        }
    });
}

/**
 * The Labour Force Survey provides the LMI For All API's unemployment information. Note that unemployment is not
 * precisely tracked per occupation in the LFS, so the figures are somewhat fuzzy.
 *
 * NOTE : Here we can actaully get the unemployment by age!
 * Also by qualification, also by Female/Males
 *
 * @param soc
 * @param region
 */
function getUnemployment(soc){
    $.ajax({
        type: 'GET',
//        url: 'http://api.lmiforall.org.uk/api/v1/ess/region/'+region+'/'+soc+'?coarse=true',
        url: 'http://api.lmiforall.org.uk/api/v1/lfs/unemployment?soc='+soc+'&minYear=2012&maxYear=2012',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            console.log('LFS Data on Unemployment : ' + JSON.stringify(json));

          ractive.set('unemploymentRate', parseInt(json.years[0].unemprate));
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON from Unemployment');
        }
    });
}

//soc is Standard Occupational Classification
function getEstimatedPay(soc){
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc='+soc+'&coarse=true',
        async: false,
        jsonpCallback: 'jsonCallback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            console.log('Estimated Pay Info : ' + JSON.stringify(json));
            console.log(json.series[0].estpay);

            setMoneyFutureData(json);
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
        }
    });
}

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

function setMoneyFutureData(json){

    var predictedInflation = avgRetailPriceIndex();
    var yearsAtUniversity = 3;

    var estimatedAverageSalaryWeeklyPay = parseInt(json.series[0].estpay);
    var estimatedAverageSalaryYearlyPay = estimatedAverageSalaryWeeklyPay * WEEKS_IN_YEAR;
    var easYearlyPayGraduationYear = estimatedAverageSalaryYearlyPay;

    for(var i=0; i < yearsAtUniversity;i++){
        easYearlyPayGraduationYear += (easYearlyPayGraduationYear / 100) * predictedInflation;
    }

    ractive.set('easYearlyPayGraduationYear', numberWithCommaAtThousand(parseInt(easYearlyPayGraduationYear)));
    ractive.set('estimatedPayWeekly', estimatedAverageSalaryWeeklyPay);
    ractive.set('estimatedPayYearly', numberWithCommaAtThousand(estimatedAverageSalaryYearlyPay));
}

function getRegionWorkFuture(soc){
    console.log('get work futures');
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/wf/predict/breakdown/region?soc='+soc+'&minYear=2014&maxYear=2020',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            console.log('regionAna')

            //getJobFutureInRegionChartFormatted(json);
            drawChart(getJobFutureInRegionChartJSFormatted(json,1)); //rename

            //DX Charts
            //var workFutureFormattedData = getJobFutureInRegionDXChartFormatted(json,1);
            //var workFutureRange = [];
            //workFutureRange = getWorkFutureChartRange(workFutureFormattedData);
            //chartContainerWorkFuture(workFutureFormattedData,workFutureRange[0],workFutureRange[1]);

            calcJobPercentageChangeRegion(json, getCurrentYear(), getGraduationYear(),1);
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
        }
    });
}

function getWorkFutureChartRange(data){

    var workFutureChartRange=[];
    workFutureChartRange.push(parseInt(data[0].employment));
    workFutureChartRange.push(parseInt(data[data.length - 1].employment));

    return workFutureChartRange.sort(function(a, b){return a - b});
}

function getNestoriaData(){

    console.log('get Nestoria Data');
    $.ajax({
        type: 'GET',
        url: 'http://api.nestoria.co.uk/api?country=uk&pretty=1&action=metadata&place_name=London&encoding=json',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            extractNestoriaData(json,"2011_m10");
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON from Nestoria');
        }
    });
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

    createFutureRentChart(avgRentPrices);
    createCurrentRentChart(avgRentPrices);


    createCurrentPurchaseChart(avgBuyPrices);
    createFuturePurchaseChart(avgBuyPrices);

    console.log(avgRentPrices);
    console.log(avgBuyPrices);

    ractive.set("rentPrices", avgRentPrices);
    ractive.set("buyPrices", avgBuyPrices);


}

function createCurrentRentChart(data){

    var priceData = [];
    var endValue = data[data.length - 1].price;

    for(var i=0;i<data.length;i++){
        priceData.push(parseInt(data[i].price));
    }

    chartContainerCurrentRent(priceData, endValue);
}

function createFutureRentChart(data){

    var averagePriceIncrease = 1.5;
    var priceData = [];
    var endValue = (data[data.length - 1].price) * averagePriceIncrease;

    for(var i=0;i<data.length;i++){
        priceData.push(parseInt(data[i].price) * averagePriceIncrease);
    }

    chartContainerFutureRent(priceData, endValue);
}

function createCurrentPurchaseChart(data){

    var priceData = [];
    var endValue = data[data.length - 1].price;

    for(var i=0;i<data.length;i++){
        priceData.push(parseInt(data[i].price));
    }

    chartContainerCurrentPurchasePrice(priceData, endValue);
}

function createFuturePurchaseChart(data){

    var averagePriceIncrease = 1.5;
    var priceData = [];
    var endValue = (data[data.length - 1].price) * averagePriceIncrease;

    for(var i=0;i<data.length;i++){
        priceData.push(parseInt(data[i].price) * averagePriceIncrease);
    }

    chartContainerFuturePurchasePrice(priceData, endValue);
}


function getJobFutureInRegionChartJSFormatted(json,region){

    var year=[];
    var predictedNumberEmployed=[];

    for(var index = 0; index < json.predictedEmployment.length; index++){
        year.push(parseInt(json.predictedEmployment[index].year));
        for(var j=0;j<json.predictedEmployment[index].breakdown.length; j++){

            if(parseInt(json.predictedEmployment[index].breakdown[j].code) == 1){
                predictedNumberEmployed.push(parseInt(json.predictedEmployment[index].breakdown[j].employment))
                break;
            }
        }
    }

    var data = {
        labels : year,
        datasets : [
            {
//                fillColor : "rgba(255,204,0,0.45)",
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

    var dataSource = [
        {year: "Monday", employment: 3},
        {year: "Tuesday", employment: 2},
        {year: "Wednesday", employment: 3},
        {year: "Thursday", employment: 4},
        {year: "Friday", employment: 6},
        {year: "Saturday", employment: 11},
        {year: "Sunday", employment: 4} ];

//    var data = {
//        labels : year,
//        datasets : [
//            {
////                fillColor : "rgba(255,204,0,0.45)",
//                fillColor : "#CE0043",
//                strokeColor : "#CE0043",
//                pointColor : "#CE0043",
//                pointStrokeColor : "#CE0043",
//                data : predictedNumberEmployed
//            },
//        ]
//    }

    return employmentByYearData;

}

//function getCareerWorkFuture(soc){
//    console.log('get work futures');
//    $.ajax({
//        type: 'GET',
//        url: 'http://api.lmiforall.org.uk/api/v1/wf/predict?soc='+soc+'&minYear=2013&maxYear=2020',
//        async: false,
//        contentType: "application/json",
//        dataType: 'jsonp',
//        success: function(json) {
//            drawChart(createCareerFutureDataForChart(json)); //rename
//            calcJobPercentageChange(json, getCurrentYear(), getGraduationYear());
//        },
//        error: function(e) {
//            console.log(e.message);
//            alert('I have no JSON');
//        }
//    });
//}

function getEductionWorkFuture(soc){
    console.log('get education work futures');

    var futureEducationDataForEmployed = [];
    var formattedDatasetForEmployedChart = [];

    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/wf/predict/breakdown/qualification?soc='+soc+'&minYear=2013&maxYear=2020',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {

            futureEducationDataForEmployed = getFutureEducationDataForEmployed(json,getGraduationYear());
            formattedDatasetForEmployedChart = createFormattedDataForEducationChart(futureEducationDataForEmployed);

//            drawEducationFutureChart(formattedDatasetForEmployedChart);
//            drawEducationFutureKey(futureEducationDataForEmployed, getEmployedGraduationYear());
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON Education Work Futures');
        }
    });
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

//function calcJobPercentageChange(json, currentYear, graduationYear){
//
//    console.log('json' + JSON.stringify(json));
//
//    var employedCurrently=0;
//    var employedGraduationYear=0;
//
//    for(var i=0;i < json.predictedEmployment.length;i++){
//        var year = parseInt(json.predictedEmployment[i].year);
//        var numberEmployed = parseInt(json.predictedEmployment[i].employment);
//
//        if(year == currentYear){
//            employedCurrently = numberEmployed;
//            console.log('Currently Employed set as ' + employedCurrently);
//        }else if(year == graduationYear){
//            employedGraduationYear = numberEmployed;
//            console.log('In Graduation year Employed set as ' + employedGraduationYear);
//        }
//    }
//
//    setJobPercentageChange(calcPercentageChange(employedCurrently, employedGraduationYear));
//    setJobIncreaseOrDecrease(calcJobIncreaseOrDecrease(employedCurrently, employedGraduationYear));
//
//    ractive.set("employedCurrently", employedCurrently);
//    ractive.set("employedGraduationYear", employedGraduationYear);
//
//}

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

function scrollToStart(){
    console.log('scrolling');
//    $('html, body').animate({
//        scrollTop: $("#start-content").offset().top
//    }, 1000);
}

//scrollToStart();
//drawChart();


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

        if(predictedEmployment[i].year == 2017){

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



function createFormattedDataForEducationChart(futureEducationData){

    var formattedEducationChartData = [];
    for(var j=0; j < futureEducationData.length;j++){
        formattedEducationChartData.push({value:futureEducationData[j].employment, color:futureEducationData[j].color});
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

function drawSkillChart(data){

    this.skillData = data;

    $('#skill-chart').remove();
    $('.skill-chart-container').append('<canvas id="skill-chart"></canvas>');

    $('#skill-chart').attr('width', jQuery(".skill-chart-container").width());
    $('#skill-chart').attr('height', (jQuery(".skill-chart-container").height() * 1.8));

    var ctx = $('#skill-chart').get(0).getContext("2d");

    var options = {
//        animateRotate : true,
    }

    new Chart(ctx).Radar(data,options);             //watch out here for memory issues
}

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


function resizeEducationChart(){

    $('#education-chart').remove();
    $('.education-chart-container').append('<canvas id="education-chart"></canvas>');
    var ctx = $('#education-chart').get(0).getContext("2d");

    $('#education-chart').attr('width', jQuery(".education-chart-container").width());
    $('#education-chart').attr('height', (jQuery(".education-chart-container").height()*1.8));
    new Chart(ctx).Pie(this.eductionFutureData);
}

function drawSavingsChart(){

    var palette = ['#b4d34f', '#d3dc5a', '#f1e064', '#fad075', '#fa9a46', '#fa6b63'];

    var dataSource = [
        {region: "Council Tax, Gas, Water, Electricity", val: 150},
        {region: "Food", val: 200},
        {region: "Rent", val: 600},
        {region: "Entertainment", val: 200},
        {region: "Travel", val: 150},
        {region: "Savings", val: 500}
    ];

    $("#chartContainer").dxPieChart({
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
                    size: 18
                },
                format: "millions",
                connector: {
                    visible: true
                },
                position: "columns",
                customizeText: function(arg) {
                    if(arg.argumentText == "Savings"){
                        return arg.percentText + " of Estimate Avg. Salary Saved!";
                    }else{
                        return arg.percentText + " of Salary spent on " + arg.argumentText;
                    }
                }
            }
        }]
    });
}

function drawSavingsOverTimeChart(){

    var palette = ['#b4d34f', '#d3dc5a', '#f1e064', '#fad075', '#fa9a46', '#fa6b63'];

    var dataSource = [
        { year: 2016, savings: 0 },
        { year: 2017, savings: 1000 },
        { year: 2018, savings: 1500},
        { year: 2019, savings: 1900 },
        { year: 2020, savings: 2300},
        { year: 2021, savings: 4000}
    ];

    $("#chartContainerSavingsOverTime").dxChart({
        dataSource: dataSource,
        commonSeriesSettings: {
            argumentField: "year"
        },
        commonAxisSettings: {
            grid: {
                visible: true
            }
        },
        series: [
            { valueField: "savings", name: "Savings" }
        ],
        tooltip:{
            enabled: true
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
//        legend: {
//            enabled:false,
//            verticalAlignment: "bottom",
//            horizontalAlignment: "center"
//        },
        commonPaneSettings: {
            border:{
                visible: true,
                bottom: false
            }
        }
    });
}

function chartContainerCurrentRent(data,endValue){
    $('#chartContainerCurrentRent').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values: data,
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
    $('#chartContainerFutureRent').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values:data,
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
    $('#chartContainerCurrentPurchasePrice').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values: data,
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
    $('#chartContainerFuturePurchasePrice').dxBarGauge({
        startValue: 0,
        endValue: endValue,
        values:data,
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
    var palette = ['#b4d34f', '#d3dc5a', '#f1e064', '#fad075', '#fa9a46', '#fa6b63'];

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
    var palette = ['#b4d34f', '#d3dc5a', '#f1e064', '#fad075', '#fa9a46', '#fa6b63'];

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

function chartContainerDegreeEducated(){
    var palette = ['#9BCE7d', '#72Ac93', '#699E87', '#BD0102', '#98002F', '#fa6b63'];

    var dataSource = [
        {region: "Council Tax, Gas, Water, Electricity", val: 150},
        {region: "Food", val: 200},
        {region: "Rent", val: 600},
        {region: "Entertainment", val: 200},
        {region: "Travel", val: 150},
        {region: "Savings", val: 500}
    ];

    $("#chartContainerDegreeEducated").dxPieChart({
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
//$(window).resize(resizeEducationChart);


listenDropdownGraduationChange();

$(window).resize(drawSavingsChart);
$(window).resize(drawSavingsOverTimeChart);

drawSavingsChart();
drawSavingsOverTimeChart();

//chartContainerCurrentRent();
//chartContainerFutureRent();

chartContainerFutureCostOfLiving();
chartContainerCurrentCostOfLiving();

getNestoriaData();

chartContainerDegreeEducated();
//chartContainerWorkFuture();