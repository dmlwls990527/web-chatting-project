import sys
import joblib
from sklearn.metrics import r2_score
from sklearn.metrics import mean_squared_error, mean_absolute_error
from sklearn.feature_extraction.text import CountVectorizer

# 학습된 모델 로드
model = joblib.load('politeness_model.joblib')

# 특성 벡터화를 위한 vectorizer 로드
vectorizer = CountVectorizer(decode_error="replace", vocabulary=joblib.load("vectorizer.joblib"))

text = sys.argv[1]
new_text_vectorized = vectorizer.transform([text])

predicted_score = model.predict(new_text_vectorized)

if predicted_score[0] > 1:
    predicted_score[0] = 0.99998

# 예측된 politeness 점수를 stdout으로 출력하여 server.js에서 받아서 사용할 수 있도록 함
print(predicted_score[0])