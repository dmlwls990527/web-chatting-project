import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge

# 데이터 로드
data = pd.read_csv('C:/Users/82104/Desktop/politeness.csv')

# 특성과 라벨 분리
X = data['txt']
y = data['score']

# 특성 벡터화
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(X)

# 학습 데이터와 테스트 데이터 분리
train_data = data[data['split'] == 'train']

# 특성과 라벨 분리
X_train = train_data['txt']
y_train = train_data['score']

# 특성 벡터화
vectorizer = CountVectorizer()
X_train = vectorizer.fit_transform(X_train)

# 모델 정의
model = Ridge()

# 모델 학습
model.fit(X_train, y_train)

# 학습된 모델 저장
import joblib
joblib.dump(model, 'politeness_model.joblib')
