use chrono::{Datelike, Duration, Local, TimeZone, Timelike};
use chrono_tz::Asia::Tokyo;
use cron::Schedule;
use serde::Serialize;
use std::str::FromStr;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
pub struct ScatterPoint {
    x: f64,             // X-axis: time in decimal hours (e.g., 12.5 = 12:30)
    y: i32,             // Y-axis: day of week (0=Sunday, 6=Saturday)
    z: i32,             // Z-axis: size of the scatter point (fixed at 100)
    day_label: String,  // Human-readable day name ("Sun", "Mon", etc.)
    time: String,       // Formatted time string ("JST: YYYY-MM-DD HH:MM")
}

#[wasm_bindgen]
pub struct CronParser;

#[wasm_bindgen]
impl CronParser {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        CronParser
    }

    /// Parse a cron expression and return all occurrences within the current week
    ///
    /// # Arguments
    /// * `cron_expr` - Standard UNIX cron expression (5 fields: "minute hour day month weekday")
    /// * `time_format` - Time format: "JST" (default) or "UTC" (adds 9 hours to convert UTC to JST)
    ///
    /// # Returns
    /// * `Ok(JsValue)` - Array of ScatterPoint objects for the week
    /// * `Err(JsValue)` - Error message if the cron expression is invalid
    ///
    /// # Example
    /// ```javascript
    /// const parser = new CronParser();
    /// const data = parser.parse_expression("0 12 * * *", "JST");  // Every day at 12:00 JST
    /// const utcData = parser.parse_expression("0 12 * * *", "UTC");  // UTC 12:00 → displayed as JST 21:00
    /// ```
    #[wasm_bindgen]
    pub fn parse_expression(&self, cron_expr: &str, time_format: &str) -> Result<JsValue, JsValue> {
        // Parse standard UNIX cron expression (5 fields: minute hour day month weekday)
        // The cron crate expects 6 fields (second minute hour day month weekday),
        // so we prepend "0" to set seconds to 0
        // Example: "0 12 * * *" becomes "0 0 12 * * *"

        // Convert UNIX cron weekday format (0=Sun) to Rust cron format (1=Sun)
        let converted_expr = convert_unix_to_rust_cron(cron_expr.trim());
        let cron_with_seconds = format!("0 {}", converted_expr);

        let schedule = Schedule::from_str(&cron_with_seconds)
            .map_err(|e| JsValue::from_str(&format!("Invalid cron expression: {}", e)))?;

        let now = Local::now();  

        let days_since_sunday = now.weekday().num_days_from_sunday();

        // Go back to the start of the week (Sunday 00:00:00)
        let start_of_week = (now - Duration::days(days_since_sunday as i64))
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap();

        // Calculate end of week (Saturday 23:59:59)
        let end_of_week = start_of_week + Duration::days(7) - Duration::seconds(1);

        // Collect all cron occurrences within the week
        let mut data = Vec::new();

        // Convert NaiveDateTime to DateTime<Tokyo> (add JST timezone information)
        let tokyo_start = Tokyo.from_local_datetime(&start_of_week).unwrap();
        let tokyo_end = Tokyo.from_local_datetime(&end_of_week).unwrap();

        // Iterate through all cron occurrences within the week
        for datetime in schedule.after(&tokyo_start) {
            if datetime >= tokyo_end {
                break;
            }

            // Determine the display time based on time_format
            let (display_hour, display_minute, display_day, time_label) = if time_format == "UTC" {
                // Convert UTC to JST by adding 9 hours
                let jst_datetime = datetime + Duration::hours(9);
                let jst_day = jst_datetime.weekday().num_days_from_sunday() as i32;
                let jst_hour = jst_datetime.hour() as f64;
                let jst_minute = jst_datetime.minute() as f64;
                let jst_label = format!("JST: {}", jst_datetime.format("%Y-%m-%d %H:%M"));
                (jst_hour, jst_minute, jst_day, jst_label)
            } else {
                // JST (default)
                let day = datetime.weekday().num_days_from_sunday() as i32;
                let hour = datetime.hour() as f64;
                let minute = datetime.minute() as f64;
                let label = format!("JST: {}", datetime.format("%Y-%m-%d %H:%M"));
                (hour, minute, day, label)
            };

            let point = ScatterPoint {
                x: display_hour + display_minute / 60.0,  // Convert time to decimal hours (e.g., 12:30 → 12.5)
                y: display_day,                           // Day of week for y-axis (0-6)
                z: 100,                                   // Fixed size for all scatter points
                day_label: format_day(display_day),       // Convert day number to label: "Sun", "Mon", etc.
                time: time_label,                         // e.g., "JST: 2025-09-30 12:00" or "UTC: 2025-09-30 03:00"
            };

            data.push(point);
        }

        // Convert Rust Vec<ScatterPoint> to JavaScript Array
        serde_wasm_bindgen::to_value(&data)
            .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
    }

    /// Count the number of cron occurrences in the current week
    ///
    /// # Arguments
    /// * `cron_expr` - Standard UNIX cron expression
    ///
    /// # Returns
    /// * Number of times the cron will execute this week
    ///
    /// # Example
    /// ```javascript
    /// const parser = new CronParser();
    /// const count = parser.count_occurrences("0 12 * * *");  // Returns 7 (once per day)
    /// ```
    #[wasm_bindgen]
    pub fn count_occurrences(&self, cron_expr: &str) -> Result<usize, JsValue> {
        // Just count occurrences without building data structures
        let cron_with_seconds = format!("0 {}", cron_expr.trim());

        let schedule = Schedule::from_str(&cron_with_seconds)
            .map_err(|e| JsValue::from_str(&format!("Invalid cron expression: {}", e)))?;

        let now = Local::now();
        let days_since_sunday = now.weekday().num_days_from_sunday();
        let start_of_week = (now - Duration::days(days_since_sunday as i64))
            .date_naive()
            .and_hms_opt(0, 0, 0)
            .unwrap();
        let end_of_week = start_of_week + Duration::days(7) - Duration::seconds(1);

        let tokyo_start = Tokyo.from_local_datetime(&start_of_week).unwrap();
        let tokyo_end = Tokyo.from_local_datetime(&end_of_week).unwrap();

        // Count occurrences without building data structures
        let mut count = 0;
        for datetime in schedule.after(&tokyo_start) {
            if datetime > tokyo_end {
                break;
            }
            count += 1;
        }

        Ok(count)
    }
}

/// Convert UNIX cron weekday format to Rust cron format
///
/// UNIX cron: 0=Sunday, 1=Monday, ..., 6=Saturday
/// Rust cron: 1=Sunday, 2=Monday, ..., 7=Saturday
///
/// # Arguments
/// * `cron_expr` - UNIX cron expression (5 fields)
///
/// # Returns
/// * Converted cron expression with Rust weekday numbering
fn convert_unix_to_rust_cron(cron_expr: &str) -> String {
    let parts: Vec<&str> = cron_expr.split_whitespace().collect();

    // Standard 5-field cron: minute hour day month weekday
    if parts.len() != 5 {
        return cron_expr.to_string();  // Return as-is if not standard format
    }

    let weekday_field = parts[4];

    // Convert weekday field: 0→7, 1→1, 2→2, ..., 6→6
    // Also handle ranges (0-5), lists (0,1,2), and steps (*/2)
    let converted_weekday = convert_weekday_field(weekday_field);

    format!("{} {} {} {} {}", parts[0], parts[1], parts[2], parts[3], converted_weekday)
}

/// Convert a single weekday field from UNIX to Rust format
fn convert_weekday_field(field: &str) -> String {
    // Handle wildcard and question mark
    if field == "*" || field == "?" {
        return field.to_string();
    }

    // Handle ranges (e.g., "1-5" → "2-6", "0-5" → "1,7")
    if field.contains('-') && !field.contains('/') {
        let range_parts: Vec<&str> = field.split('-').collect();
        if range_parts.len() == 2 {
            if let (Ok(start), Ok(end)) = (range_parts[0].parse::<i32>(), range_parts[1].parse::<i32>()) {
                // Convert range by converting each endpoint
                let converted_start = (start % 7) + 1;  // 0→1, 1→2, ..., 6→7
                let converted_end = (end % 7) + 1;

                return format!("{}-{}", converted_start, converted_end);
            }
        }
    }

    // Handle lists (e.g., "0,2,4" → "1,3,5")
    if field.contains(',') {
        let items: Vec<&str> = field.split(',').collect();
        let converted_items: Vec<String> = items
            .iter()
            .map(|item| {
                // Handle ranges within lists
                if item.contains('-') {
                    convert_weekday_field(item)
                } else {
                    convert_single_weekday(item)
                }
            })
            .collect();
        return converted_items.join(",");
    }

    // Handle steps (e.g., "*/2")
    if field.contains('/') {
        return field.to_string();  // Steps work the same way
    }

    // Handle single number
    convert_single_weekday(field)
}

/// Convert a single weekday number
/// UNIX: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
/// Rust: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
///
/// Rust uses 1-7 but Sunday can be either 1 or 7
/// For simplicity: 0→1, 1→2, 2→3, 3→4, 4→5, 5→6, 6→7
fn convert_single_weekday(day: &str) -> String {
    if let Ok(num) = day.parse::<i32>() {
        ((num % 7) + 1).to_string()  // 0→1, 1→2, ..., 6→7
    } else {
        day.to_string()
    }
}

/// Helper function to convert day number to 3-letter abbreviation
///
/// # Arguments
/// * `day` - Day of week as integer (0=Sunday, 6=Saturday)
///
/// # Returns
/// * 3-letter day abbreviation ("Sun", "Mon", etc.)
fn format_day(day: i32) -> String {
    match day {
        0 => "Sun".to_string(),
        1 => "Mon".to_string(),
        2 => "Tue".to_string(),
        3 => "Wed".to_string(),
        4 => "Thu".to_string(),
        5 => "Fri".to_string(),
        6 => "Sat".to_string(),
        _ => "Unknown".to_string(),  // Should never happen
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_day() {
        assert_eq!(format_day(0), "Sun");
        assert_eq!(format_day(1), "Mon");
        assert_eq!(format_day(2), "Tue");
        assert_eq!(format_day(3), "Wed");
        assert_eq!(format_day(4), "Thu");
        assert_eq!(format_day(5), "Fri");
        assert_eq!(format_day(6), "Sat");
        assert_eq!(format_day(999), "Unknown");
    }

    // Note: Functions with #[wasm_bindgen] attribute can only be tested in WASM context
    // Here we test helper functions and internal logic that don't require WASM

    #[test]
    fn test_cron_schedule_parsing_valid() {
        // Test the underlying cron parsing logic
        use cron::Schedule;
        use std::str::FromStr;

        // Test 6-field format (what we actually use internally)
        let result = Schedule::from_str("0 0 12 * * *");
        assert!(result.is_ok(), "Valid 6-field cron should parse");
    }

    #[test]
    fn test_cron_schedule_parsing_invalid() {
        use cron::Schedule;
        use std::str::FromStr;

        let result = Schedule::from_str("invalid cron");
        assert!(result.is_err(), "Invalid cron should return error");
    }

    #[test]
    fn test_cron_weekday_format() {
        use cron::Schedule;
        use std::str::FromStr;

        // Test weekday format (1-5 = Monday-Friday in Rust cron)
        let result = Schedule::from_str("0 0 9 * * 1-5");
        assert!(result.is_ok(), "Weekday cron should parse correctly");
    }

    #[test]
    fn test_cron_interval_format() {
        use cron::Schedule;
        use std::str::FromStr;

        // Test interval format (every 30 minutes)
        let result = Schedule::from_str("0 */30 * * * *");
        assert!(result.is_ok(), "Interval cron should parse correctly");
    }

    #[test]
    fn test_cron_multiple_times() {
        use cron::Schedule;
        use std::str::FromStr;

        // Test multiple specific times
        let result = Schedule::from_str("0 0 0,12 * * *");
        assert!(result.is_ok(), "Multiple times cron should parse correctly");
    }

    #[test]
    fn test_5_to_6_field_conversion() {
        use cron::Schedule;
        use std::str::FromStr;

        // Simulate our conversion logic (prepend "0" for seconds)
        let five_field = "0 12 * * *";
        let six_field = format!("0 {}", five_field);

        assert_eq!(six_field, "0 0 12 * * *");

        let result = Schedule::from_str(&six_field);
        assert!(result.is_ok(), "Converted 6-field format should parse");
    }

    #[test]
    fn test_convert_unix_to_rust_weekday_single() {
        // 0 (Sunday) converts to 1
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 0"), "0 12 * * 1");

        // 1 (Monday) converts to 2
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 1"), "0 12 * * 2");

        // 5 (Friday) converts to 6
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 5"), "0 12 * * 6");

        // 6 (Saturday) converts to 7
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 6"), "0 12 * * 7");
    }

    #[test]
    fn test_convert_unix_to_rust_weekday_list() {
        // List with 0: "0,2,4" → "1,3,5"
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 0,2,4"), "0 12 * * 1,3,5");

        // List without 0: "1,3,5" → "2,4,6"
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 1,3,5"), "0 12 * * 2,4,6");
    }

    #[test]
    fn test_convert_unix_to_rust_weekday_range() {
        // Range starting with 0: "0-5" → "1-6" (Sun-Fri)
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 0-5"), "0 12 * * 1-6");

        // Range not including 0: "1-5" → "2-6" (Mon-Fri)
        assert_eq!(convert_unix_to_rust_cron("0 12 * * 1-5"), "0 12 * * 2-6");
    }

    #[test]
    fn test_convert_unix_to_rust_weekday_wildcard() {
        // Wildcard should stay as-is
        assert_eq!(convert_unix_to_rust_cron("0 12 * * *"), "0 12 * * *");
    }

    #[test]
    fn test_cron_daily_at_noon_generates_correct_times() {
        use cron::Schedule;
        use std::str::FromStr;
        use chrono::{TimeZone, Timelike};

        // Parse "0 12 * * *" (daily at noon)
        let schedule = Schedule::from_str("0 0 12 * * *").unwrap();

        // Get occurrences starting from Jan 1, 2025
        let start = chrono_tz::Asia::Tokyo.with_ymd_and_hms(2025, 1, 1, 0, 0, 0).unwrap();

        let occurrences: Vec<_> = schedule.after(&start).take(7).collect();

        // Should have 7 occurrences (one per day)
        assert_eq!(occurrences.len(), 7);

        // Check first occurrence
        let first = occurrences[0];
        assert_eq!(first.hour(), 12, "Hour should be 12");
        assert_eq!(first.minute(), 0, "Minute should be 0");

        // Check all occurrences are at 12:00
        for occurrence in occurrences {
            assert_eq!(occurrence.hour(), 12);
            assert_eq!(occurrence.minute(), 0);
        }
    }

    #[test]
    fn test_cron_weekdays_only() {
        use cron::Schedule;
        use std::str::FromStr;
        use chrono::{Datelike, TimeZone};

        // Parse "0 9 * * 1-5" (weekdays at 9am)
        // Note: In Rust cron library, 1=Sunday, 2=Monday, ..., 6=Friday, 7=Saturday
        // So "1-5" means Sunday through Thursday
        let schedule = Schedule::from_str("0 0 9 * * 1-5").unwrap();

        // Start from Sunday, Jan 5, 2025
        let start = chrono_tz::Asia::Tokyo.with_ymd_and_hms(2025, 1, 5, 0, 0, 0).unwrap();

        let occurrences: Vec<_> = schedule.after(&start).take(5).collect();

        // Should have 5 occurrences
        assert_eq!(occurrences.len(), 5);

        // Check that all occurrences are at 9:00
        for occurrence in &occurrences {
            assert_eq!(occurrence.hour(), 9, "Hour should be 9");
            assert_eq!(occurrence.minute(), 0, "Minute should be 0");
        }

        // The pattern "1-5" in Rust cron means Sunday through Thursday
        // So the days should be: Sun, Mon, Tue, Wed, Thu
        let expected_weekdays = vec![0, 1, 2, 3, 4]; // Sun=0, Mon=1, ..., Thu=4
        let actual_weekdays: Vec<_> = occurrences
            .iter()
            .map(|dt| dt.weekday().num_days_from_sunday())
            .collect();

        assert_eq!(
            actual_weekdays, expected_weekdays,
            "Should be Sun-Thu (0-4), got {:?}",
            actual_weekdays
        );
    }

    #[test]
    fn test_cron_every_30_minutes_timing() {
        use cron::Schedule;
        use std::str::FromStr;
        use chrono::{TimeZone, Timelike};

        // Parse "*/30 * * * *" (every 30 minutes)
        let schedule = Schedule::from_str("0 */30 * * * *").unwrap();

        let start = chrono_tz::Asia::Tokyo.with_ymd_and_hms(2025, 1, 1, 0, 0, 0).unwrap();

        let occurrences: Vec<_> = schedule.after(&start).take(48).collect();

        // Should have 48 occurrences in a day (24 hours * 2)
        assert_eq!(occurrences.len(), 48);

        // Check first few occurrences
        assert_eq!(occurrences[0].hour(), 0);
        assert_eq!(occurrences[0].minute(), 30);

        assert_eq!(occurrences[1].hour(), 1);
        assert_eq!(occurrences[1].minute(), 0);

        assert_eq!(occurrences[2].hour(), 1);
        assert_eq!(occurrences[2].minute(), 30);

        // Verify all are at :00 or :30
        for occurrence in occurrences {
            let minute = occurrence.minute();
            assert!(minute == 0 || minute == 30, "Minute should be 0 or 30, got {}", minute);
        }
    }

    #[test]
    fn test_cron_twice_daily() {
        use cron::Schedule;
        use std::str::FromStr;
        use chrono::{TimeZone, Timelike};

        // Parse "0 0,12 * * *" (midnight and noon)
        let schedule = Schedule::from_str("0 0 0,12 * * *").unwrap();

        let start = chrono_tz::Asia::Tokyo.with_ymd_and_hms(2025, 1, 1, 0, 0, 0).unwrap();

        let occurrences: Vec<_> = schedule.after(&start).take(4).collect();

        // Should have 4 occurrences (2 per day * 2 days)
        assert_eq!(occurrences.len(), 4);

        // Check hours alternate between 0 and 12
        assert_eq!(occurrences[0].hour(), 12); // First is noon (after midnight start)
        assert_eq!(occurrences[1].hour(), 0);  // Next midnight
        assert_eq!(occurrences[2].hour(), 12); // Next noon
        assert_eq!(occurrences[3].hour(), 0);  // Next midnight
    }

    #[test]
    fn test_format_day_all_values() {
        // Test all possible day values with their expected strings
        let expected = vec![
            (0, "Sun"),
            (1, "Mon"),
            (2, "Tue"),
            (3, "Wed"),
            (4, "Thu"),
            (5, "Fri"),
            (6, "Sat"),
        ];

        for (day_num, expected_label) in expected {
            assert_eq!(
                format_day(day_num),
                expected_label,
                "Day {} should be {}",
                day_num,
                expected_label
            );
        }
    }
}
