var jobMatches = [];

//NAME SPACING NEEDED
//USE LONDON RENTS FROM http://www.voa.gov.uk/

var ractive = new Ractive({
    el:'container',
    template:'#myTemplate',
    data: {greeting:'hello',recipient:'sdsds',estimatedPayWeekly:0,estimatedPayYearly:0,jobTitle:'Job Title Holder',jobDescription:'Job Description',jobTasks:'Job Tasks',
        qualificationsRequired:'Qualifications Holder',workFutureJobs:2323,jobs:jobMatches,
        percentSkillsShortages:20,percentHardToFill:20,percentHardToFillIsSkillsShortages:21,unemploymentRate:6,
        yearsAtUniversity:0,graduationYear:0,jobPercentageChange:0,employedCurrently:0,employedGraduationYear:0,jobIncreaseOrDecrease:'no data'}
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

function getOnet(soc){
//    getSocToOnet();



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

function setMoneyFutureData(json){

    var estimatedWeeklyPay = parseInt(json.series[0].estpay);

    ractive.set('estimatedPayWeekly', estimatedWeeklyPay);
    ractive.set('estimatedPayYearly', estimatedWeeklyPay * WEEKS_IN_YEAR);
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

//            getJobFutureInRegionChartFormatted(json);
            drawChart(getJobFutureInRegionChartFormatted(json,1)); //rename
//            calcJobPercentageChange(json, getCurrentYear(), getGraduationYear());
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
        }
    });
}

function getJobFutureInRegionChartFormatted(json,region){

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

function getCareerWorkFuture(soc){
    console.log('get work futures');
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/wf/predict?soc='+soc+'&minYear=2013&maxYear=2020',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            drawChart(createCareerFutureDataForChart(json)); //rename
            calcJobPercentageChange(json, getCurrentYear(), getGraduationYear());
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
        }
    });
}

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

            drawEducationFutureChart(formattedDatasetForEmployedChart);
            drawEducationFutureKey(futureEducationDataForEmployed, getEmployedGraduationYear());
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON Education Work Futures');
        }
    });
}

function calcJobPercentageChange(json, currentYear, graduationYear){

    console.log('json' + JSON.stringify(json));

    var employedCurrently=0;
    var employedGraduationYear=0;

    for(var i=0;i < json.predictedEmployment.length;i++){
        var year = parseInt(json.predictedEmployment[i].year);
        var numberEmployed = parseInt(json.predictedEmployment[i].employment);

        if(year == currentYear){
            employedCurrently = numberEmployed;
            console.log('Currently Employed set as ' + employedCurrently);
        }else if(year == graduationYear){
            employedGraduationYear = numberEmployed;
            console.log('In Graduation year Employed set as ' + employedGraduationYear);
        }
    }

    setJobPercentageChange(calcPercentageChange(employedCurrently, employedGraduationYear));
    setJobIncreaseOrDecrease(calcJobIncreaseOrDecrease(employedCurrently, employedGraduationYear));

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

function setJobIncreaseOrDecrease(increaseOrDecrease){
    ractive.set("jobIncreaseOrDecrease", increaseOrDecrease);
}

function setJobPercentageChange(percentage){

    console.log(percentage);
    console.log(Math.round(percentage));

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

function drawQualitiesChart(data){

    this.qualitiesData = data;

    $('#qualities-chart').remove();
    $('.qualities-chart-container').append('<canvas id="qualities-chart"></canvas>');

    $('#qualities-chart').attr('width', jQuery(".qualities-chart-container").width());
    $('#qualities-chart').attr('height', (jQuery(".qualities-chart-container").height() * 1.8));

    var ctx = $('#qualities-chart').get(0).getContext("2d");

    var options = {
//        animateRotate : true,
    }

    new Chart(ctx).Pie(data,options);             //watch out here for memory issues
}



function drawChart(data){

    this.data = data;

    $('#career-future-chart').remove();
    $('.career-future-chart-container').append('<canvas id="career-future-chart"></canvas>');

    $('#career-future-chart').attr('width', jQuery(".career-future-chart-container").width());
    $('#career-future-chart').attr('height', (jQuery(".career-future-chart-container").height() * 1.8));

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
    $('#career-future-chart').attr('height', (jQuery(".career-future-chart-container").height()*1.8));
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




$(window).resize(resizeChart);
$(window).resize(resizeEducationChart);

listenDropdownGraduationChange();