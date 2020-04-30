import { ForExp, AppExp, Exp, Program,makeAppExp,makeProcExp, isForExp,isDefineExp, makeDefineExp, isNumExp, makeNumExp, makeForExp, makeVarDecl, CExp, NumExp } from "./L21-ast";
import { Result, makeFailure, makeOk } from "../imp/result";
import { reduce, map } from "ramda";

/*
Purpose: @TODO
Signature: @TODO
Type: @TODO
*/


export const for2app = (exp: ForExp): AppExp =>{
    
    
    // return makeAppExp ( makeAppExp( makeProcExp([], lambdaLoop(exp.start.val,exp,[]) ) ,/*numberLoop(exp.start.val,exp.end.val,[])*/ [] ),[] );

    const full= map(n=> makeAppExp( makeProcExp([exp.var],[exp.body]) ,[n] ), numberLoop(exp.start.val,exp.end.val,[]));

    return makeAppExp(makeProcExp([],full),[]);
}

export const numberLoop = (start: number, end: number, rands: CExp[]): CExp[] =>
    (start<=end) ? rands.concat(makeNumExp(start)).concat(numberLoop(start+1,end,[])) :
    rands;

export const loop = (exp : ForExp, num: number,body: CExp[]): CExp[] => 
    num>exp.end.val ? body :
    [makeAppExp(makeProcExp([], body.concat( makeProcExp([],[exp.body,makeNumExp(num)])).concat(loop(exp,num+1,body)) ) ,[] )];
/*
Purpose: @TODO
Signature: @TODO
Type: @TODO
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    // isDefineExp(exp)? makeOk(makeDefineExp(exp.var,exp.val)):
    // isNumExp(exp)? makeOk(makeNumExp):
    // isForExp(exp)? makeOk(makeForExp):
    // makeFailure("");
    isForExp(exp)? makeOk(for2app(exp)):
    makeOk(exp);