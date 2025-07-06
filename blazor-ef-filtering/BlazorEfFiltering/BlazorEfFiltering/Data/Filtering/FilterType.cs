namespace BlazorEfFiltering.Data.Filtering;

public enum FilterType
{
    Text,
    Number,
    Date,
    Boolean,
    Select
}

public enum TextFilterOperation
{
    Contains,
    StartsWith,
    EndsWith,
    Equals,
    NotEquals
}

public enum NumberFilterOperation
{
    Equals,
    NotEquals,
    GreaterThan,
    LessThan,
    GreaterThanOrEqual,
    LessThanOrEqual,
    Between
}

public enum DateFilterOperation
{
    Equals,
    NotEquals,
    Before,
    After,
    Between
}