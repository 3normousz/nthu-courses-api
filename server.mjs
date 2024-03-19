import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const COURSE_DATA_URL = 'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/OPENDATA/open_course_data.json';

/*
Attributes:
    id (str): 科號。
    chinese_title (str): 課程中文名稱。
    english_title (str): 課程英文名稱。
    credit (str): 學分數。
    size_limit (str): 人限：若為空字串表示無人數限制。
    freshman_reservation (str): 新生保留人數：若為0表示無新生保留人數。
    object (str): 通識對象：[代碼說明(課務組)](https://curricul.site.nthu.edu.tw/p/404-1208-11133.php)。
    ge_type (str): 通識類別。
    language (str): 授課語言："中"、"英"。
    note (str): 備註。
    suspend (str): 停開註記："停開"或空字串。
    class_room_and_time (str):教室與上課時間：一間教室對應一個上課時間，中間以tab分隔；多個上課教室以new line字元分開。
    teacher (str): 授課教師：多位教師授課以new line字元分開；教師中英文姓名以tab分開。
    prerequisite (str): 擋修說明：會有html entities。
    limit_note (str): 課程限制說明。
    expertise (str): 第一二專長對應：對應多個專長用tab字元分隔。
    program (str): 學分學程對應：用半形/分隔。
    no_extra_selection (str): 不可加簽說明。
    required_optional_note (str): 必選修說明：多個必選修班級用tab字元分隔。
*/

class Condition {
    constructor(row_field, matcher, regex_match = true) {
        this.row_field = row_field;
        this.matcher = matcher;
        this.regex_match = regex_match;
    }

    check(course) {
        const fieldData = course[this.row_field];
        if (!fieldData) {
            return false;
        }
        if (this.regex_match) {
            const regex = new RegExp(this.matcher, 'i');
            const matchResult = regex.test(fieldData);
            return matchResult;
        } else {
            const exactMatch = fieldData === this.matcher;
            return exactMatch;
        }
    }

}

app.get('/courses', async (req, res) => {
    try {
        const response = await fetch(COURSE_DATA_URL);
        const courses = await response.json();

        const condition = new Condition('課程英文名稱', 'Programming', true);

        const filteredCourses = courses.filter(course => {
            const result = condition.check(course);
            return result;
        });

        console.log(`Filtered down to ${filteredCourses.length} courses.`);
        res.json(filteredCourses);
    } catch (error) {
        console.error('Failed to fetch course data:', error);
        res.status(500).json({ message: 'Failed to fetch course data' });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
