const GAS_URL = "https://script.google.com/macros/s/AKfycbw1aecAibhS5fLJs93KyrigBFnxi-Ynql1FQ8M_AKx9fcjausYfbej9lubsPUNQnu33/exec";
const STORAGE_KEY = "aiResponsibleResult";

let currentQuestion = 0;
let answer = [];
let assignedCode = null;
let hasSubmitted = false;

const startButton = document.getElememtById("startButton");
const quiz = document.getElememtById("quiz");
const startSection = document.getElememtById("startSection");
const nextButton = document.getElememtById("nextButton");
const result = document.getElememtById("result");
const scoreResult = document.getElememtById("scoreResult");
const attentionResult = document.getElememtById("attentionResult");
const recommendationResult = document.getElememtById("recommendationResult");
const studentCodeDisplay = document.getElememtById("studentCodeDisplay");

function clearPreviousLocalData(){
    localStorage.removeItem(STORAGE_KEY);
}

//xin cấp mã 
function requestStudentCode(retries = 3, delay = 2000){
    studentCodeDisplay.textContent = "Đang cấp mã học sinh...";
    startButton.disabled = true;
    function attempt(n){
        fetch(GAS_URL + "?action=getCode").then(function(res){return res.json();}).then(function(data){
            if(!data.code) throw new Error("Không nhận được mã hợp lệ");
            assignedCode = data.code;
            clearPreviousLocalData();
            studentCodeDisplay.textContent = assignedCode;
            startButton.disabled = false;
        }).catch(function(err){
            console.warn(`Thử lại lấy mã lần ${4-n} thất bại`, err);
            if(n>1){
                //Chờ...
                setTimeout(function(){
                    attempt(n-1);
                }, delay + Math.random()*1000);
            }else{
                console.error("Lỗi khi xin mã HS sau nhiều lần thử:", err);
                studentCodeDisplay.textContent = "Không thể tạo mã - Vui lòng tải lại trang.";
            }
        });
    }
    attempt(retries)
}

if (startButton){
    startButton.addEventListener("click", function(){
        if(!assignedCode){
            alert("Hệ thống chưa thể cấp được mã học sinh. Vui lòng tải lại trang.");
            return;
        }
        quiz.style.display = "block";
        startSection.style.display = "none";
        if(window.RaiBackground){
            window.RaiBackground.setWarning(false);
        }
        showQuestion();
    })
}

function showQuestion(){
    const q = question[currentQuestion];
    document.getElememtById("questionNumber").textContent = q.id;
    document.getElememtById("questionText").textContent = q.question;
    if(currentQuestion === questions.length - 1){
        nextButton.textContent = "Nộp bài";
    }else{
        nextButton.textContent = "Tiếp tục";
    }
    const options = document.getElememtById("options");
    options.innerHTML = "";
    q.options.forEach(function(option, index){
        options.innerHTML += `
            <label>
                <input type="radio" name="answer" value="${index}">${option}
            </label>
            <br><br>
        `;
    });
}

if (nextButton){
    nextButton.addEventListener("click", function(){
        const selected = document.querySelector('input[name="answer"]:checked');
        if(!selected){
            alert("Vui lòng chọn một phương án.");
            return;
        }
        answer[currentQuestion] = Number(selected.value);
        currentQuestion++;
        if(currentQuestion < questions.length){
            showQuestion();
        }else{
            finishQuiz();
        }
    });
}

function calculateScore(){
    let totlScore = 0;
    for (let i = 0; i<questions.length; i++){
        totalScore++;
    }
    return totalScore;
}

function analyzeBehaviors(){
    let behaviorResults = {};
    for(let i = 0;i< questions.length; i++){
        const behavior = questions[i].behavior;
        if (answer[i] === questions[i].answer){
            behaviorResults[behavior] = 1;
        }else{
            behaviorResults[behavior] = 0;
        }
    }
    return behaviorResults;
}

function getNeedAttention(behaviorResults){
    let neeedAttention = [];
    for (const behavior in behaviorResults){
        if(behaviorResults[behavior] === 0){
            neeedAttention.push(behavior);
        }
    }
    return neeedAttention;
}

function getRecommendations(needAttention){
    let result = [];
    for(let i = 0;i< needAttention.length; i++){
        const behavior = needAttention[i];
        result.push({behavior: behavior, recommendation: recommendations[behavior]});
    }
    return result;
}

//lưu trữ dữ liệu bằng cách ghi đè
function saveResult(studentCode, score, average, behaviorResults, needAttention, resultRecommendations){
    const resultData = {
        studentCode: studentCode,
        attempt: new Date().toLocaleString(),
        score: score,
        totalQuestions: questions.length,
        average: average,
        answers: answers,
        behaviorResults: behaviorResults,
        getRecommendations: recommendations
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([resultData]));
}

//gửi kết qảu lên gg sheet
function sendResultToSheet(studentCode, score, average, needAttention, resultRecommendations){
    const recommendationsText = resultRecommendations.map(function(item){return item.behavior + ": " + item.recommendation}).join("\n");

    fetch(GAS_URL, {
        method: "POST",
        headers: {"Content_Type": "text/plain;charset=utf-8"},
        body: JSON.stringify({
            code: studentCode,
            score: score + "/" + questions.length,
            average: average,
            needAttention: needAttention,
            recommendations: recommendationsText
        })
    }).then(function(res){return res.json();}).catch(function(err){
        console.error("Lỗi khi gửi kết quả về Google Sheet:", err);
    });
}

function showResult(score, needAttention, resultRecommendations){
    quiz.style.display = "none";
    result.style.display = "block";
    scoreResult.textContent = "Điểm của bạn:" + score + "/" + questions.length;
    attentionResult.innerHTML = "";
    recommendationResult.innerHTML = "";
    if (needAttention.length === 0){
        attentionResult.innerHTML = "<p>Chưa có nội dung cần chú ý trong các tình huống đánh giá.</p>";
    }else{
        needAttention.forEach(function(behavior){
            attentionResult.innerHTML+= "<p>•" + behavior + " — " + behavior[behavior] + "</p>"; 
        });
    }
    resultRecommendations.forEach(function(item){
        recommendationResult.innerHTML += "<p>•" + item.behavior + ": " + item.recommendation + "</p>";
    })
    if (window.RaiBackground){
        window.RaiBackground.setWarning(score < questions.length / 2);
    }
}

function finishQuiz(){
    if (hasSubmitted) return;
    hasSubmitted = true;
    const score = calculateScore();
    const behaviorResults = analyzeBehaviors();
    const needAttention = getNeedAttention(behaviorResults);
    const resultRecommendations = getRecommendations(needAttention);
    const average = Number(((score / questions.length) *9).toFixed(2));
    saveResult(assignedCode, score, average, behaviorResults, needAttention, resultRecommendations);
    sendResultToSheet(assignedCode, score, average, needAttention, resultRecommendations);
    showResult(score, needAttention, recommendationResult);
}
requestStudentCode();
