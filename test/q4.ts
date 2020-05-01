import { Exp, Program,isProgram,isBoolExp,isNumExp,isVarRef,isPrimOp,isDefineExp,isProcExp,isIfExp,isAppExp, PrimOp, ProcExp, AppExp, CExp} from '../imp/L2-ast';
import { Result, makeOk, makeFailure,bind,safe2,safe3,mapResult } from '../imp/result';
import { map } from "ramda";

/*
Purpose: @TODO
Signature: @TODO
Type: @TODO
*/
export const l2ToJS = (exp: Exp | Program): Result<string> => 
    isProgram(exp) ? bind(mapResult(l2ToJS, exp.exps), (exps: string[]) => makeOk(ProgramToJs(exps))) :
    isBoolExp(exp) ? makeOk(exp.val ? "true" : "false") :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(primToJs(exp)) :
    isDefineExp(exp) ? bind(l2ToJS(exp.val), (val: string) => makeOk(`const ${exp.var.var} = ${val}`)) :
    isProcExp(exp) ? bind(mapResult(l2ToJS, exp.body), (body: string[]) => 
        makeOk(`((${map(v => v.var, exp.args).join(",")}) => ${proctoJsConvert(body)})`)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(${test} ? ${then} : ${alt})`))
                    (l2ToJS(exp.test), l2ToJS(exp.then), l2ToJS(exp.alt)) :
    isAppExp(exp) ? safe2((rator: string, rands: string[]) => makeOk(appToJs(exp,rator,rands)))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
    makeFailure(`Unknown expression: ${exp}`);
    

export const primToJs = (exp: PrimOp) : string =>
    (exp.op=="not") ? "!" :
    (exp.op=="and") ? "&&" :
    (exp.op=="or") ? "||" :
    (exp.op=="=" ||exp.op=="eq?") ? "===" :
    exp.op;

export const appToJs = (exp: AppExp, rator: string, rands: string[]) : string =>
    (exp.rator.tag=="PrimOp") ?
    ((rator==="!") ?`(!${rands[0]})` : (rator==="boolean?") ? `(typeof ${rands[0]} === "boolean")` :
      (rator==="number?") ? `(typeof ${rands[0]} === "number")` : `(${rands.join(" "+rator.toString()+" ")})` ) :
    `${rator}(${rands.join(",")})` ;


export const proctoJsConvert = (body: string[]) : string =>
        (body.length ===1) ? body[0] :
        ("{"+body.slice(0,body.length-1).join("; ")+"; return "+body[body.length-1]+";}");


export const ProgramToJs = (exp: string[]) : string =>
        (exp.length===1) ? exp[0] :
        (exp.slice(0,exp.length-1).join(";\n")+";\nconsole.log("+exp[exp.length-1]+");");