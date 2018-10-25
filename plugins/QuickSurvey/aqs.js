var atlasQuickSurvey = {
    buildResult: function (name, elm) {
        inputTags = elm.getElementsByTagName('input');
        optionTags = elm.getElementsByTagName('option');
        textAreas = elm.getElementsByTagName('textarea');
        resultObj = {
            'survey_name': name,
            'survey_result': {}
        };
        if (inputTags.length > 0) {
            for (var i = 0; i < inputTags.length; i++) {
                var key = inputTags[i].name;
                var val = inputTags[i].value;
                if (inputTags[i].type === 'radio' || inputTags[i].type === 'checkbox') {
                    if (inputTags[i].checked) {
                        if (!resultObj['survey_result'][key]) {
                            resultObj['survey_result'][key] = {};
                        }
                        resultObj['survey_result'][key][val] = true;
                    }
                } else if (inputTags[i].type === 'text' || inputTags[i].type === 'date') {
                    if (val.length > 0) {
                        resultObj['survey_result'][key] = val;
                    }
                }
            }
        }
        if (optionTags.length > 0) {
            for (var i = 0; i < optionTags.length; i++) {
                var key = optionTags[i].parentNode.name;
                var val = optionTags[i].value;
                if (optionTags[i].selected) {
                    resultObj['survey_result'][key] = val;
                }
            }
        }
        if (textAreas.length > 0) {
            for (var i = 0; i < textAreas.length; i++) {
                var key = textAreas[i].name;
                var val = textAreas[i].value;
                if (val.length > 0) {
                    resultObj['survey_result'][key] = val;
                }
            }
        }
        return resultObj;
    },
    submitResult: function (name, elm) {
        var result = this.buildResult(name, elm);
        atlasTracking.trackAction('answer', 'survey', null, {
            action_name: name,
            custom_value: result
        });
    }

};

var aqsEasyUtils = {
    buildSurvey: function (title, description, name, form, style, submit) {
        var surveyWindow = document.createElement('div')
        surveyWindow.innerHTML = '<div class="__aqs_title__">' + title + '</div><div class="__aqs_close__"><button type="button">閉じる</button></div><div class="__aqs_description__">' + description + '</div><div><form name="' + name + '">' + form + '<br /><button type="button">' + submit + '</button></form></div>'
        surveyWindow.setAttribute('id', '__atlasQuickSurveyWindow__');
        surveyWindow.setAttribute('style', 'visibility:hidden;transition:all .4s ease; -webkit-transition:all .4s ease;opacity:0;' + style);
        surveyWindow.getElementsByTagName('button')[0].addEventListener('click', this.closeSurvey, false);
        surveyWindow.getElementsByTagName('button')[1].addEventListener('click', function () {
            atlasQuickSurvey.submitResult('complete_survey_test_01', surveyWindow);
            var target = document.getElementById('__atlasQuickSurveyWindow__');
            target.innerHTML = '<div style="width:100%;text-align:center;">ありがとうございました</div>';
            setTimeout(function () {
                target.remove();
            }, 1500);
        }, false);

        document.body.appendChild(surveyWindow);
    },
    startSurvey: function () {
        var target = document.getElementById('__atlasQuickSurveyWindow__');
        target.style.opacity = 1;
        target.style.visibility = "visible";
    },
    closeSurvey: function () {
        var target = document.getElementById('__atlasQuickSurveyWindow__');
        target.remove();
    },
};
