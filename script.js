const GAS_URL = "https://script.google.com/macros/s/AKfycbz-5yR_OfUhyZh_cub0tUGZLMp0GoRBZtxv1SvoPmDKasdmLIbNuU_GobQ1E4hKDOa9/exec";
const STORAGE_KEY = "aiResponsibleResult";

let currentQuestion = 0;
let answers = [];
let assignedCode = null;
let hasSubmitted = false;
let selectedQuestions = [];

const BEHAVIOR_ORDER = [
    "HV01",
    "HV02",
    "HV03",
    "HV04",
    "HV05",
    "HV06",
    "HV07",
    "HV08",
    "HV09"
];

const startButton = document.getElementById("startButton");
const quiz = document.getElementById("quiz");
const startSection = document.getElementById("startSection");
const nextButton = document.getElementById("nextButton");
const result = document.getElementById("result");
const scoreResult = document.getElementById("scoreResult");
const attentionResult = document.getElementById("attentionResult");
const recommendationResult = document.getElementById("recommendationResult");
const studentCodeDisplay = document.getElementById("studentCodeDisplay");

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
        try{
            selectedQuestions = selectOneQuestionPerBehavior();
            currentQuestion = 0;
            answers = [];
            hasSubmitted = false;
            console.table{
                selectedQuestions.map(function(q){
                    return{
                        HV:q.behavior,
                        Cau:q.id
                    };
                })
            };
        }catch(error){
            console.error(error);
            alert("Lỗi khi tạo bộ câu hỏi. Vui lòng kiểm tra ngân hàng câu hỏi.");
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

function selectedOneQuestionPerBehavior(){
    const selected = [];
    BEHAVIOR_ORDER.forEach(function(behavior){
        const candidates = questions.filter(function(q){
            return q.behavior === behavior;
        });
        if (candidates.length === 0){
            throw new Error("Không tìm thấy câu hỏi cho " + behavior);
        }
        const randomIndex = Math.floor(Math.random()*candidates.length);
        selected.push(candidates[randomIndex]);
    });
    return selected;
}

function showQuestion(){
    const q = selectedQuestions[currentQuestion];
    document.getElementById("questionNumber").textContent = "Câu" + (currentQuestion + 1) + "/" + selectedQuestions.length;
    document.getElementById("questionText").textContent = q.question;
    if(currentQuestion === questions.length - 1){
        nextButton.textContent = "Nộp bài";
    }else{
        nextButton.textContent = "Tiếp tục";
    }
    nextButton.style.display = "inline-block";
    const options = document.getElementById("options");
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
        answers[currentQuestion] = Number(selected.value);
        currentQuestion++;
        if(currentQuestion < questions.length){
            showQuestion();
        }else{
            finishQuiz();
        }
    });
}

function calculateScore(){
    let totalScore = 0;
    for (let i = 0; i<selectedQuestions.length; i++){
        if(answers[i] === selectedQuestions[i].answer){
            totalScore++;
        }
    }
    return totalScore;
}

function analyzeBehaviors(){
    let behaviorResults = {};
    for(let i = 0;i< selectedQuestions.length; i++){
        const behavior = selectedQuestions[i].behavior;
        if (answers[i] === selectedQuestions[i].answer){
            behaviorResults[behavior] = 1;
        }else{
            behaviorResults[behavior] = 0;
        }
    }
    return behaviorResults;
}

function getNeedAttention(behaviorResults){
    let needAttention = [];
    for (const behavior in behaviorResults){
        if(behaviorResults[behavior] === 0){
            needAttention.push(behavior);
        }
    }
    return needAttention;
}

function getRecommendations(needAttention){
    let resultArr = [];
    for(let i = 0;i< needAttention.length; i++){
        const behavior = needAttention[i];
        if (recommendations && recommendations[behavior]){
            resultArr.push({behavior: behavior, recommendation: recommendations[behavior]});
        }else{
            resultArr.push({behavior: behavior, recommendation: "Cần lưu ý quy tắc tuân thủ khi sử dụng AI."});
        }
    }
    return resultArr;
}

//lưu trữ dữ liệu bằng cách ghi đè
function saveResult(studentCode, score, average, behaviorResults, needAttention, resultRecommendations){
    const selectedQuestionInfo = selectedQuestions.map(function(q){
        return{
            id:q.id,
            behavior:q.behavior
        };
    });
    const resultData = {
        studentCode: studentCode,
        attempt: new Date().toLocaleString(),
        version: "Final",
        score: score,
        totalQuestions: selectedQuestions.length,
        average: average,
        answers: answers,
        selectedQuestions: selectedQuestionInfo,
        behaviorResults: behaviorResults,
        recommendations: resultRecommendations
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([resultData]));
}

//gửi kết qảu lên gg sheet
function sendResultToSheet(studentCode, score, average, needAttention, resultRecommendations){
    let attentionText = "";
    if (Array.isArray(needAttention) && needAttention.length > 0){
        attentionText = needAttention.join(", ");
    }
    let recommendationsText = "";
    if (Array.isArray(resultRecommendations)){
        recommendationsText = resultRecommendations.map(function(item){
            return (item.behavior || "") + ": " +(item.recommendation || "");
        }).join("\n");
    }
    const selectedQuestionsText=selectedQuestions.map(function(q){
        return q.behavior + ":" + q.id;
    }).join("|");
    fetch(GAS_URL, {
        method: "POST",
        headers: {"Content-Type": "text/plain;charset=utf-8"},
        body: JSON.stringify({
            code: studentCode,
            score: score + "/" + selectedQuestions.length,
            average: average,
            needAttention: attentionText,
            recommendations: recommendationsText,
            version: "Final"
        })
    }).then(function(res){return res.json();
    }).then(function(data){console.log("Google Sheet:", data); 
    }).catch(function(err){
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
            attentionResult.innerHTML+= "<p>•" + behavior +  " — " + behaviors[behavior] + "</p>"; 
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
    const average = Number(((score / questions.length) *10).toFixed(2));
    saveResult(assignedCode, score, average, behaviorResults, needAttention, resultRecommendations);
    sendResultToSheet(assignedCode, score, average, needAttention, resultRecommendations);
    showResult(score, needAttention, resultRecommendations);
}
requestStudentCode();
