var jobMatches = [];

//USE LONDON RENTS FROM http://www.voa.gov.uk/

var ractive = new Ractive({
    el:'container',
    template:'#myTemplate',
    data: {greeting:'hello',recipient:'sdsds',estimatedPayWeekly:0,estimatedPayYearly:0,jobTitle:'Job Title Holder',
        qualificationsRequired:'Qualifications Holder',workFutureJobs:2323,jobs:jobMatches,
        percentSkillsShortages:20,percentHardToFill:20,percentHardToFillIsSkillsShortages:21,unemploymentRate:6,
        yearsAtUniversity:0,graduationYear:0,jobPercentageChange:0,employedCurrently:0,employedGraduationYear:0,jobIncreaseOrDecrease:'no data'}
});


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
    getWorkFuture(soc);
    getEstimatedPay(soc);

    scrollToStart();

    setYearsAtUniversity(getGraduationYear(), getCurrentYear());
    ractive.set("graduationYear", getGraduationYear());
}

function setYearsAtUniversity(startYear, finishYear){
    ractive.set('yearsAtUniversity', startYear - finishYear);
}

function getCurrentYear(){
    return 2014;
}

function getGraduationYear(){
    return parseInt($("#graduation-input").val());
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

function getWorkFuture(soc){
    console.log('get work futures');
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/wf/predict?soc='+soc+'&minYear=2013&maxYear=2020',
        async: false,
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
//            console.log('Work Future : ' + JSON.stringify(json));
            drawChart(createDataForChart(json));
            calcJobPercentageChange(json, getCurrentYear(), getGraduationYear());

//           ractive.set('workFutureJobs', json.predictedEmployment[3].employment)
        },
        error: function(e) {
            console.log(e.message);
            alert('I have no JSON');
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

function createDataForChart(json){
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

function drawChart(data){
    $('#myChart').remove();
    $('.salary-chart').append('<canvas id="myChart" width="515" height="335"></canvas>');
    var ctx = $('#myChart').get(0).getContext("2d");

    var options = {
        bezierCurve : false
    }

    new Chart(ctx).Bar(data,options);             //watch out here for memory issues
}