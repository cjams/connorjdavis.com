import { evaluate, parse } from 'mathjs';
import type { MathNode } from 'mathjs';
import type { MathFunction, MathParsingResult, ValidationResult } from '../types/3d';

/**
 * Parse and compile a mathematical expression into a function
 * that can be evaluated with x and y parameters
 */
export function parseMathExpression(expression: string): MathParsingResult {
  try {
    // Basic validation
    if (!expression || expression.trim().length === 0) {
      return {
        success: false,
        error: 'Expression cannot be empty'
      };
    }

    // Parse the expression
    const node = parse(expression);
    
    // Create a compiled function for better performance
    const compiledFunction = node.compile();

    // Create the evaluation function
    const evaluateFunction = (x: number, y: number): number => {
      try {
        const result = compiledFunction.evaluate({ x, y });
        
        // Handle special cases
        if (typeof result !== 'number') {
          throw new Error('Expression must evaluate to a number');
        }
        
        if (!isFinite(result)) {
          // Return a large but finite number for infinity
          return result > 0 ? 1000000 : -1000000;
        }
        
        return result;
      } catch (error) {
        console.warn(`Evaluation error at (${x}, ${y}):`, error);
        return 0; // Return 0 for invalid evaluations
      }
    };

    // Create gradient function using numerical differentiation
    const gradientFunction = (x: number, y: number): [number, number] => {
      const h = 0.001; // Small step for numerical differentiation
      
      // Partial derivative with respect to x
      const fx1 = evaluateFunction(x + h, y);
      const fx2 = evaluateFunction(x - h, y);
      const dfdx = (fx1 - fx2) / (2 * h);
      
      // Partial derivative with respect to y
      const fy1 = evaluateFunction(x, y + h);
      const fy2 = evaluateFunction(x, y - h);
      const dfdy = (fy1 - fy2) / (2 * h);
      
      return [dfdx, dfdy];
    };

    const mathFunction: MathFunction = {
      expression,
      evaluate: evaluateFunction,
      gradient: gradientFunction
    };

    return {
      success: true,
      function: mathFunction
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

/**
 * Basic validation for mathematical expressions
 */
export function validateMathExpression(expression: string): ValidationResult {
  if (!expression || expression.trim().length === 0) {
    return {
      isValid: false,
      error: 'Expression cannot be empty'
    };
  }

  try {
    // Test parse and evaluation
    const node = parse(expression);
    const compiledFunction = node.compile();
    const testResult = compiledFunction.evaluate({ x: 1, y: 1 });
    
    if (typeof testResult !== 'number') {
      return {
        isValid: false,
        error: 'Expression must evaluate to a number'
      };
    }

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid mathematical expression'
    };
  }

  return { isValid: true };
}
