import { expect } from 'chai';
import { parseL2, parseL2Exp } from '../imp/L2-ast';
import { l2ToJS } from './q4';
import { bind, Result, makeOk, isFailure } from '../imp/result';
import { parse as p } from "../imp/parser";

const l2toJSResult = (x: string): Result<string> =>
    bind(bind(p(x), parseL2Exp), l2ToJS);

describe('Q4 Tests', () => {
    it('parses primitive ops', () => {
        expect(l2toJSResult(`(+ 3 5 7)`)).to.deep.equal(makeOk(`(3 + 5 + 7)`));
        expect(l2toJSResult(`(= 3 (+ 1 2))`)).to.deep.equal(makeOk(`(3 === (1 + 2))`));
    });

    it('parses "if" expressions', () => {
        expect(l2toJSResult(`(if (> x 3) 4 5)`)).to.deep.equal(makeOk(`((x > 3) ? 4 : 5)`));
    });

    it('parses "lambda" expressions', () => {
        expect(l2toJSResult(`(lambda (x y) (* x y))`)).to.deep.equal(makeOk(`((x,y) => (x * y))`));
        expect(l2toJSResult(`((lambda (x y) (* x y)) 3 4)`)).to.deep.equal(makeOk(`((x,y) => (x * y))(3,4)`));
    });
    
    it("defines constants", () => {
        expect(l2toJSResult(`(define pi 3.14)`)).to.deep.equal(makeOk(`const pi = 3.14`));
    });

    it("defines functions", () => {
        expect(l2toJSResult(`(define f (lambda (x y) (* x y)))`)).to.deep.equal(makeOk(`const f = ((x,y) => (x * y))`));
    });

    it("applies user-defined functions", () => {
        expect(l2toJSResult(`(f 3 4)`)).to.deep.equal(makeOk(`f(3,4)`));
    });

    it("parses functions with multiple body expressions", () => {
        expect(l2toJSResult(`(define g (lambda (x y) (+ x 2) (- y 3) (* x y)))`)).to.deep.equal(makeOk(`const g = ((x,y) => {(x + 2); (y - 3); return (x * y);})`));
    });

    it('parses programs', () => {
        expect(bind(parseL2(`(L2 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = (3 > 4);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((!b) ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses one line program', () => {
        expect(bind(parseL2(`(L2 (if (> 5 3) 4 8))`), l2ToJS)).to.deep.equal(makeOk(`((5 > 3) ? 4 : 8)`));
    });
    it('parses programs with boolean', () => {
        expect(bind(parseL2(`(L2 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if #t (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = (3 > 4);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n(true ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses programs with and', () => {
        expect(bind(parseL2(`(L2 (define b (and (> 3 4) (= 5 5))) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if #t (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) && (5 === 5));\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n(true ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses programs with and', () => {
        expect(bind(parseL2(`(L2 (define b (and (> 3 4) (= 5 5))) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (boolean? #f) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) && (5 === 5));\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((typeof false === "boolean") ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('Adler test', () => {
        expect(bind(parseL2(`(if 3 4)`), l2ToJS)).to.satisfy(isFailure);
    });
    it('parses programs with or', () => {
        expect(bind(parseL2(`(L2 (define b (or (> 3 4) (= 5 5) #f)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (number? (* 4 5 6)) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) || (5 === 5) || false);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((typeof (4 * 5 * 6) === "number") ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses programs with eq?', () => {
        expect(bind(parseL2(`(L2 (define b (and (> 3 4) (eq? #t 5))) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if #t (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = ((3 > 4) && (true === 5));\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n(true ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    });
    it('parses primitive ops', () => {
        expect(l2toJSResult(`(+ 3 5 7)`)).to.deep.equal(makeOk(`(3 + 5 + 7)`));
        expect(l2toJSResult(`(= 3 (+ 1 2))`)).to.deep.equal(makeOk(`(3 === (1 + 2))`));

        expect(l2toJSResult(`(> (+ x 1) (* x x))`)).to.deep.equal(makeOk(`((x + 1) > (x * x))`));

        
    });

    it('parses "if" expressions', () => {
        expect(l2toJSResult(`(if (> x 3) 4 5)`)).to.deep.equal(makeOk(`((x > 3) ? 4 : 5)`));
    
        expect(l2toJSResult(`(if #t 1 2)`)).to.deep.equal(makeOk(`(true ? 1 : 2)`));
        expect(l2toJSResult(`(if (< x 2) x 2)`)).to.deep.equal(makeOk(`((x < 2) ? x : 2)`));
    
        
    
    });

    it('parses "lambda" expressions', () => {
        expect(l2toJSResult(`(lambda (x y) (* x y))`)).to.deep.equal(makeOk(`((x,y) => (x * y))`));
        expect(l2toJSResult(`((lambda (x y) (* x y)) 3 4)`)).to.deep.equal(makeOk(`((x,y) => (x * y))(3,4)`));
    
        expect(l2toJSResult(`(lambda () 1)`)).to.deep.equal(makeOk(`(() => 1)`));
        expect(l2toJSResult(`(lambda (x) x x)`)).to.deep.equal(makeOk(`((x) => {x; return x;})`));
    
    });
    
    it("defines constants", () => {
        expect(l2toJSResult(`(define pi 3.14)`)).to.deep.equal(makeOk(`const pi = 3.14`));
        
        expect(l2toJSResult(`(define x 1)`)).to.deep.equal(makeOk(`const x = 1`));

        expect(l2toJSResult(`(define)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define x)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define x y z)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define "1" y)`)).to.satisfy(isFailure);
        expect(l2toJSResult(`(define 1 y)`)).to.satisfy(isFailure);
    });

    it("defines functions", () => {
        expect(l2toJSResult(`(define f (lambda (x y) (* x y)))`)).to.deep.equal(makeOk(`const f = ((x,y) => (x * y))`));
    });

    it("applies user-defined functions", () => {
        expect(l2toJSResult(`(f 3 4)`)).to.deep.equal(makeOk(`f(3,4)`));
    });

    it("parses functions with multiple body expressions", () => {
        expect(l2toJSResult(`(define g (lambda (x y) (+ x 2) (- y 3) (* x y)))`)).to.deep.equal(makeOk(`const g = ((x,y) => {(x + 2); (y - 3); return (x * y);})`));
    });

    it('parses programs', () => {
        expect(bind(parseL2(`(L2 (define b (> 3 4)) (define x 5) (define f (lambda (y) (+ x y))) (define g (lambda (y) (* x y))) (if (not b) (f 3) (g 4)) ((lambda (x) (* x x)) 7))`), l2ToJS)).to.deep.equal(makeOk(`const b = (3 > 4);\nconst x = 5;\nconst f = ((y) => (x + y));\nconst g = ((y) => (x * y));\n((!b) ? f(3) : g(4));\nconsole.log(((x) => (x * x))(7));`));
    
        expect(bind(parseL2(`(L2 (define x 1) (> (+ x 1) (* x x)))`), l2ToJS)).to.deep.equal(makeOk(`const x = 1;\nconsole.log(((x + 1) > (x * x)));`));
        expect(bind(parseL2(`(L2 (define x 1) (define y (+ x x)) (* y y))`), l2ToJS)).to.deep.equal(makeOk(`const x = 1;\nconst y = (x + x);\nconsole.log((y * y));`));
        expect(bind(parseL2(`(L2 (lambda (x) x))`), l2ToJS)).to.deep.equal(makeOk(`((x) => x)`));
        expect(bind(parseL2(`(L2 ((lambda (x) (* x x)) x))`), l2ToJS)).to.deep.equal(makeOk(`((x) => (x * x))(x)`));
        expect(bind(parseL2(`(L2 ((lambda (x) (* x x)) 3))`), l2ToJS)).to.deep.equal(makeOk(`((x) => (x * x))(3)`));
        expect(bind(parseL2(`(L2 (lambda (z) (x z)))`), l2ToJS)).to.deep.equal(makeOk(`((z) => x(z))`));
        expect(bind(parseL2(`(L2 (lambda (z) ((lambda (w) (z w)) z)))`), l2ToJS)).to.deep.equal(makeOk(`((z) => ((w) => z(w))(z))`));
        expect(bind(parseL2(`(L2 (define square (lambda (x) (* x x))) (square 3))`), l2ToJS)).to.deep.equal(makeOk(`const square = ((x) => (x * x));\nconsole.log(square(3));`));
            

        expect(bind(parseL2(`(L2 ((lambda (x) (boolean? #t)) x))`), l2ToJS)).to.deep.equal(makeOk(`((x) => (typeof true === "boolean"))(x)`));
        expect(bind(parseL2(`(L2 ((lambda (x) (number? #t)) x))`), l2ToJS)).to.deep.equal(makeOk(`((x) => (typeof true === "number"))(x)`));

        expect(bind(parseL2(`(L2 ((lambda (x) (boolean? 2)) x))`), l2ToJS)).to.deep.equal(makeOk(`((x) => (typeof 2 === "boolean"))(x)`));
        // expect(bind(parseL2(`(L2 ((lambda (x) (number? x y)) x))`), l2ToJS)).to.deep.equal(makeOk(`((x) => (typeof xy === "number"))(x)`));

    });
});



