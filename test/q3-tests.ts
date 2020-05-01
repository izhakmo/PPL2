    import { expect } from 'chai';
import { parseL21, parseL21Exp, Exp, Program } from './L21-ast';
import { L21ToL2 } from './q3';
import { unparseL21 } from './L21-unparse';
import { Result, bind, isFailure, makeOk } from '../imp/result';
import { parse as p } from "../imp/parser";

const L21toL2Result = (x: string): Result<Exp | Program> =>
    bind(bind(p(x), parseL21Exp), L21ToL2);

describe('Q3 Tests', () => {
    it('fails when given an AppExp for "end"', () => {
        expect(L21toL2Result(`(for i 1 (+ 2 2) (* i i))`)).to.satisfy(isFailure);
    });

    it('fails when given a NumExp instead of a VarDecl loop variable', () => {
        expect(L21toL2Result(`(for 3 1 2 (* i i))`)).to.satisfy(isFailure);
    });

    it('fails when there is more than one body expression', () => {
        expect(L21toL2Result(`(for i 1 2 (+ i i) (* i i))`)).to.satisfy(isFailure);
    });

    it('fails when range is invalid', () => {
        expect(L21toL2Result(`(for i 3 1 (* i i))`)).to.satisfy(isFailure);
    });

    it('fails when less than 4 args', () => {
        expect(L21toL2Result(`(for i 1 3)`)).to.satisfy(isFailure);
    });

    it('fails when body is empty', () => {
        expect(L21toL2Result(`(for i 3 1 ())`)).to.satisfy(isFailure);
    });

    it('fails when body is undefiend var', () => {
        expect(L21toL2Result(`(for i 3 1 (x))`)).to.satisfy(isFailure);
    });

    it('fails when range is invalid', () => {
        expect(bind(bind(bind(p(`(for i 5 3 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.satisfy(isFailure);
    });
    
    it('test 1', () => {
        expect(bind(bind(bind(p(`(for i 1 3 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )`));
    });

    it('test 2', () => {
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (* i i))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )))`));
    });

    it('test 3', () => {
        expect(bind(bind(bind(p(`(for i 1 3 (for i 1 3 (* i i)))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 1) ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 2) ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 3)) )`));
    });
    it('test 4', () => {
        expect(bind(bind(bind(p(`(for i 1 3 (+ 1 2 3))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (+ 1 2 3)) 1) ((lambda (i) (+ 1 2 3)) 2) ((lambda (i) (+ 1 2 3)) 3)) )`));
    });
    it('test 5', () => {
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (for i 1 3 (* i i)))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 1) ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 2) ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 3)) )))`));
    });
    it('test 6', () => {
        expect(bind(bind(parseL21(`(L21 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`));
    });
    it('test 7', () => {
        expect(bind(bind(bind(p(`(for i 5 5 (if true 8 4))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (if true 8 4)) 5)) )`));
    });
    it('test 8', () => {
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (for i 2 4 (* x i))) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (for i 1 3 (* i i)))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) ((lambda () ((lambda (i) (* x i)) 2) ((lambda (i) (* x i)) 3) ((lambda (i) (* x i)) 4)) )) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 1) ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 2) ((lambda (i) ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )) 3)) )))`));
    });
});

