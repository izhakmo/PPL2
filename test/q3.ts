import { ForExp, AppExp, Exp, Program,makeAppExp,makeProcExp, isForExp,isDefineExp, makeDefineExp, isNumExp, makeNumExp, makeForExp, makeVarDecl, CExp, NumExp } from "./L21-ast";
import { Result, makeFailure, makeOk } from "../imp/result";
import { reduce } from "ramda";

/*
Purpose: @TODO
Signature: @TODO
Type: @TODO
*/


export const for2app = (exp: ForExp): AppExp =>{
    // const body =reduce((acc: CExp[],cur: NumExp) => cur.val<=exp.end.val
    // ? acc.concat([exp.body],cur) :acc ,[]);
    // var body=[exp.body].concat(makeNumExp(exp.start.val));
    // for(var i=exp.start.val+1;i<=exp.end.val;i++){
    //     body=body.concat(exp.body).concat(makeNumExp(i));
    // }
    // return makeAppExp(makeProcExp([],[makeProcExp([exp.var],[exp.body]),exp.start]),[]);
    // return makeAppExp(makeProcExp([],[makeProcExp([],[exp.body])]),[]);
    var bod=exp.body;
    return makeAppExp(makeProcExp([],[makeAppExp( makeProcExp([exp.var], loop(exp,exp.start.val+1,[bod].concat(exp.start) ) ),[] )]),[]);
}

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