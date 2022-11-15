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
    definition: SimpleValidatorFieldDefinition
  ) => SimpleValidatorRuleValidationResult;
}

enum FieldType {
  String,
  Number,
  Array,
}

interface SimpleValidatorFieldDefinition {
  path: string;
  label: string;
  type: FieldType;
  rules: SimpleValidatorRule[];
}

type RulesCreator = (
  availableRules: SimpleValidatorRules
) => ((() => SimpleValidatorRule) | SimpleValidatorRule)[];

interface FieldWithRules {
  path: string;
  label: string;
  type: FieldType;
  rules: RulesCreator;
}

class SimpleValidatorRules {
  required(): SimpleValidatorRule {
    return {
      validate: (data: any, definition) => {
        return {
          valid: data !== null && data !== undefined,
          message: `${definition.label} is required`,
        };
      },
    };
  }

  nonEmpty(): SimpleValidatorRule {
    return {
      validate: (data: any, definition) => {
        if (definition.type == FieldType.String) {
          return {
            valid: data != "",
            message: `${definition.label} is required`,
          };
        }

        if (definition.type == FieldType.Array) {
          return {
            valid: Array.isArray(data) && data.length > 0,
            message: `${definition.label} is required`,
          };
        }

        return {
          valid: false,
          message: `${definition.label} is required`,
        };
      },
    };
  }
}

export class SimpleValidator {
  protected fields: Record<string, SimpleValidatorFieldDefinition> = {};
  protected availableRules: SimpleValidatorRules = new SimpleValidatorRules();

  public addField(data: FieldWithRules): this {
    const path = data.path;
    const rules = data.rules;

    if (!this.fields[path]) {
      this.fields[path] = {
        path: path,
        type: data.type,
        label: data.label ?? data.path,
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

  public string(path: string, label: string, rules: RulesCreator): this {
    return this.addField({
      path: path,
      type: FieldType.String,
      label: label,
      rules: rules,
    });
  }

  public validate(data: any): SimpleValidatorValidationResult {
    const bailOnFirstError = true;

    const result: SimpleValidatorValidationResult = {
      valid: true,
      errors: {},
    };

    for (let key in this.fields) {
      const definition = this.fields[key];
      const fieldData = data[definition.path];
      const fieldRulesResults: SimpleValidatorRuleValidationResult[] = [];

      for (const rule of definition.rules) {
        let result: SimpleValidatorRuleValidationResult = {
          valid: false,
        };

        try {
          result = rule.validate(fieldData, definition);
        } catch (e) {
          result.valid = false;
          result.message = e?.toString();
        }

        fieldRulesResults.push(result);

        if (!result.valid && bailOnFirstError) {
          break;
        }
      }

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
