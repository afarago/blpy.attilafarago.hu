import fileContentSaga from '@/features/fileContent/sagas';
import pyblightSaga from '@/features/pyblight/sagas';
import { all } from 'redux-saga/effects';

export default function* rootSaga() {
    yield all([fileContentSaga(), pyblightSaga()]);
}
