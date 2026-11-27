namespace FlowForge.Application.Common.Time;

/// <summary>
/// Application-wide time helpers. Timestamps remain stored in UTC while all
/// user-facing calendar calculations use India Standard Time.
/// </summary>
public static class AppTime
{
    private static readonly TimeZoneInfo IndiaTimeZone = ResolveIndiaTimeZone();

    public static DateTime UtcNow => DateTime.UtcNow;

    public static DateTime IndiaNow => ToIndiaTime(UtcNow);

    public static DateOnly TodayInIndia => DateOnly.FromDateTime(IndiaNow);

    public static DateOnly DateInIndia(DateTime value)
    {
        return DateOnly.FromDateTime(ToIndiaTime(value));
    }

    public static DateTime ToIndiaTime(DateTime value)
    {
        var utc = value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc),
        };

        return TimeZoneInfo.ConvertTimeFromUtc(utc, IndiaTimeZone);
    }

    public static DateTime IndiaDayStartUtc(DateOnly date)
    {
        var indiaMidnight = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(indiaMidnight, IndiaTimeZone);
    }

    public static DateTime IndiaDayEndUtc(DateOnly date)
    {
        return IndiaDayStartUtc(date.AddDays(1)).AddTicks(-1);
    }

    private static TimeZoneInfo ResolveIndiaTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
        }
    }
}
