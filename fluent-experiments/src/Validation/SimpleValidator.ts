interface SimpleValidatorRuleValidationResult {
  valid: boolean;
  message?: string;
}

interface SimpleValidatorValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

interface SimpleValidatorRule {
  validate: (
    data: any,
    fieldDefinition: SimpleValidatorFieldDefinition
  ) => SimpleValidatorRuleValidationResult;
}

interface SimpleValidatorFieldDefinition {
  path: string;
  label: string;
  rules: SimpleValidatorRule[];
}

class SimpleValidatorRules {
  required(): SimpleValidatorRule {
    return {
      validate: (data: any, fieldDefinition) => {
        console.log(data);

        return {
          valid: data != "",
          message: `${fieldDefinition.label} is required`,
        };
      },
    };
  }
}

export class SimpleValidator {
  protected fields: Record<string, SimpleValidatorFieldDefinition> = {};
  protected availableRules: SimpleValidatorRules = new SimpleValidatorRules();

  public add(
    path: string,
    rules: (
      availableRules: SimpleValidatorRules
    ) => ((() => SimpleValidatorRule) | SimpleValidatorRule)[]
  ): this {
    if (!this.fields[path]) {
      this.fields[path] = {
        path: path,
        label: path,
        rules: [],
      };
    }

    this.fields[path].rules = [
      ...this.fields[path].rules,
      ...rules(this.availableRules).map((rule) =>
        typeof rule === "function" ? rule() : rule
      ),
    ];

    return this;
  }

  public validate(data: any): SimpleValidatorValidationResult {
    const result: SimpleValidatorValidationResult = {
      valid: true,
      errors: {},
    };

    for (let key in this.fields) {
      const definition = this.fields[key];
      const fieldData = data[definition.path];
      const fieldRulesResults = definition.rules.map((rule) =>
        rule.validate(fieldData, definition)
      );

      // Aggregate error messages
      const resultsWithError = fieldRulesResults.filter(
        (ruleResult) => !ruleResult.valid
      );

      if (resultsWithError.length > 0) {
        result.errors[key] = resultsWithError.map(
          (ruleResult) => ruleResult.message ?? ""
        );

        result.valid = false;
      }
    }

    return result;
  }
}
