import { ForExp, AppExp, Exp, Program,makeAppExp,makeProcExp, isForExp,isDefineExp, makeDefineExp, isNumExp, makeNumExp, makeForExp, makeVarDecl, CExp, NumExp, isCompoundExp, isAtomicExp, isAppExp, isProgram, makeProgram, isCExp, isIfExp, makeIfExp, isProcExp } from "./L21-ast";
import { Result, makeFailure, makeOk } from "../imp/result";
import { reduce, map } from "ramda";

/*
Purpose: @TODO
Signature: @TODO
Type: @TODO
*/


export const for2app = (exp: ForExp): AppExp =>{
    
    const full= map(n=> makeAppExp( makeProcExp([exp.var],[exp.body]) ,[n] ), numberLoop(exp.start.val,exp.end.val,[]));
    return makeAppExp(makeProcExp([],full),[]);

    // makeAppExp(makeProcExp([],map(n=> makeAppExp( makeProcExp([exp.var],[exp.body]) ,[n] ), numberLoop(exp.start.val,exp.end.val,[]))),[]);
}

export const numberLoop = (start: number, end: number, rands: CExp[]): CExp[] =>
    (start<=end) ? rands.concat(makeNumExp(start)).concat(numberLoop(start+1,end,[])) :
    rands;




/*
Purpose: @TODO
Signature: @TODO
Type: @TODO
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    isProgram(exp) ? makeOk( makeProgram(map(rewrite, exp.exps)) ):
    makeOk(rewrite(exp));

export const rewrite = (exp: Exp): Exp =>
    isDefineExp(exp) ? makeDefineExp(exp.var,rewriteCexp(exp.val)):
    isCExp(exp) ? rewriteCexp(exp) : exp ;


export const rewriteCexp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(rewriteCexp(exp.test),
        rewriteCexp(exp.then),rewriteCexp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteCexp(exp.rator),map(rewriteCexp,exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args,map(rewriteCexp,exp.body)) :
    isForExp(exp) ? rewriteCexp(for2app(exp)):
    exp;

