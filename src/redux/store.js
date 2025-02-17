import { combineReducers , createStore} from "redux"
import { reducer } from "./reducer"

const Storing = combineReducers({
    getTransactions : reducer,
    
})

const store = createStore(Storing)
// console.log('getTransection========',store)

export default store;