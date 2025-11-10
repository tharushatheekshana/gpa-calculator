import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const gradePoints = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};
const gradeOptions = Object.keys(gradePoints) as Array<
  keyof typeof gradePoints
>;

type GradeLetter = keyof typeof gradePoints;

interface CourseDefinition {
  name: string;
  credits: number;
}

// Hardcoded course catalog by semester
const coursesBySemesterCatalog: Record<number, CourseDefinition[]> = {
  1: [
    { name: "IS1101 - Fundamentals of Information Systems", credits: 2 },
    { name: "IS1102 - Structured Programming Techniques", credits: 2 },
    { name: "IS1103 - Structured Programming Practicum", credits: 1 },
    { name: "IS1104 - Theories of Information Systems", credits: 2 },
    { name: "IS1105 - Computer System Organization", credits: 2 },
    { name: "IS1106 - Foundations of Web Technologies", credits: 2 },
    {
      name: "IS1107 - Personal Productivity with Information Technology",
      credits: 1,
    },
    { name: "IS1108 - Fundamentals of Mathematics", credits: 2 },
    { name: "IS1109 - Statistics Probability Theory", credits: 2 },
  ],
  2: [
    { name: "IS2101 - Object Oriented Programming", credits: 2 },
    { name: "IS2102 - Object Oriented Programming Practicum", credits: 1 },
    { name: "IS2103 - Emerging IS Technologies", credits: 1 },
    { name: "IS2104 - Database Systems", credits: 2 },
    { name: "IS2105 - Database Management Systems Practicum", credits: 1 },
    { name: "IS2106 - System Analysis Design", credits: 1 },
    { name: "IS2107 - Social Professional Issues", credits: 1 },
    { name: "IS2108 - Human Computer Interaction", credits: 2 },
    { name: "IS2109 - Information Assurance Security", credits: 2 },
    { name: "IS2110 - Software Project Initiation Planning", credits: 1 },
    { name: "IS2111 - Advanced Mathematics", credits: 2 },
  ],
  3: [
    { name: "IS3101 - Object Oriented Analysis Design", credits: 2 },
    { name: "IS3102 - Data Structures Algorithms", credits: 2 },
    { name: "IS3103 - IT Governance", credits: 2 },
    { name: "IS3104 - Software Engineering", credits: 2 },
    { name: "IS3105 - IS Risk Management", credits: 2 },
    { name: "IS3106 - IS Sustainability", credits: 1 },
    { name: "IS3107 - Management Information Systems", credits: 2 },
    { name: "IS3108 - E-Business", credits: 1 },
    { name: "IS3109 - Digital Innovation", credits: 2 },
  ],
  4: [
    { name: "IS4101 - IT Auditing", credits: 2 },
    { name: "IS4102 - Web Application Development", credits: 2 },
    { name: "IS4103 - Operating Systems", credits: 2 },
    { name: "IS4104 - System Administration and Maintenance", credits: 2 },
    { name: "IS4105 - IT Procurement Management", credits: 1 },
    { name: "IS4106 - Software Architecture", credits: 2 },
    { name: "IS4107 - Professionalism Ethics in Computing", credits: 1 },
    { name: "IS4108 - IS Strategies", credits: 1 },
    { name: "IS4109 - Agile Software Development", credits: 2 },
    { name: "IS4110 - Capstone Project", credits: 2 },
  ],
  5: [
    { name: "IS5101 - Entrepreneurship Innovation", credits: 1 },
    { name: "IS5102 - Enterprise Architecture", credits: 1 },
    { name: "IS5103 - High Performance Computing", credits: 2 },
    { name: "IS5104 - Software Process Management", credits: 1 },
    { name: "IS5105 - Business Process Management", credits: 2 },
    { name: "IS5106 - UIUX Practicum", credits: 1 },
    { name: "IS5107 - Project Management Practicum", credits: 1 },
    { name: "IS5108 - Business Intelligence", credits: 2 },
    { name: "IS5109 - IS Project for Community", credits: 1 },
    { name: "Elective I", credits: 3 },
    { name: "Elective II", credits: 3 },
  ],
  6: [{ name: "IS6101 - Industrial Training", credits: 6 }],
  7: [
    { name: "IS7101 - Research Methodologies", credits: 2 },
    { name: "IS7102 - IT Law", credits: 1 },
    { name: "IS7103 - Business Process Simulation", credits: 2 },
    { name: "IS7104 - Enterprise Modelling Ontologies", credits: 2 },
    { name: "IS7105 - Organizational Behavior Management", credits: 1 },
    { name: "IS7106 - Cloud Computing", credits: 2 },
    { name: "Elective III", credits: 2 },
    { name: "Elective IV", credits: 2 },
  ],
  8: [
    { name: "IS8101 - Research Project in IS", credits: 8 },
    { name: "IS8102 - BusinessIT Alignment", credits: 2 },
    { name: "IS8103 - Human Resource Management", credits: 2 },
    { name: "IS8104 - Scientific Communication", credits: 1 },
    { name: "IS8105 - IS Economics", credits: 2 },
    { name: "IS8106 - Computer System Security", credits: 2 },
    { name: "Elective V", credits: 2 },
    { name: "Elective VI", credits: 2 },
  ],
};

interface Course {
  name: string;
  credits: number;
  grade: GradeLetter;
  semester: number;
}

export default function HomeScreen(): React.ReactElement {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semester, setSemester] = useState<number>(1);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [credits, setCredits] = useState<string>("");
  const [grade, setGrade] = useState<GradeLetter>(gradeOptions[0]);
  const [showCourseDropdown, setShowCourseDropdown] = useState<boolean>(false);

  // Animation values
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Get available courses for selected semester
  const availableCourses = coursesBySemesterCatalog[semester] || [];

  // Animate modal entrance
  useEffect(() => {
    if (showCourseDropdown) {
      Animated.spring(modalSlideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showCourseDropdown]);

  // Update credits when course is selected
  useEffect(() => {
    const course = availableCourses.find((c) => c.name === selectedCourse);
    if (course) {
      setCredits(course.credits.toString());
    }
  }, [selectedCourse, semester]);

  // Load courses from AsyncStorage when the component mounts
  useEffect(() => {
    AsyncStorage.getItem("courses").then((data) => {
      try {
        if (data) {
          const parsed = JSON.parse(data) as Course[];
          if (Array.isArray(parsed)) setCourses(parsed);
        }
      } catch (e) {
        // If parsing fails, ignore and keep empty state
      }
    });
  }, []);

  // Save courses to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);

  const addCourse = (): void => {
    if (!selectedCourse || !credits || isNaN(parseFloat(credits))) {
      Alert.alert(
        "Missing information",
        "Select a course and ensure credits are valid."
      );
      return;
    }
    setCourses([
      ...courses,
      { name: selectedCourse, credits: parseFloat(credits), grade, semester },
    ]);
    setSelectedCourse("");
    setCredits("");
    setGrade(gradeOptions[0]);
  };

  const removeCourse = (idx: number): void => {
    setCourses(courses.filter((_, i) => i !== idx));
  };

  const calculateGPA = (): string => {
    let totalCredits = 0,
      totalPoints = 0;
    courses.forEach(({ credits, grade }) => {
      totalCredits += credits;
      totalPoints += credits * gradePoints[grade];
    });
    if (totalCredits === 0) return "0.0000";
    const gpa = totalPoints / totalCredits;
    return gpa.toFixed(4);
  };

  const calculateYearGPA = (year: number): number => {
    const yearCourses = courses.filter((course) => {
      // Year 1: Semesters 1-2, Year 2: Semesters 3-4, Year 3: Semesters 5-6, Year 4: Semesters 7-8
      const startSem = (year - 1) * 2 + 1;
      const endSem = year * 2;
      return course.semester >= startSem && course.semester <= endSem;
    });

    if (yearCourses.length === 0) return 0;

    let totalCredits = 0,
      totalPoints = 0;
    yearCourses.forEach(({ credits, grade }) => {
      totalCredits += credits;
      totalPoints += credits * gradePoints[grade];
    });
    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
  };

  const calculateFGPA = (): string => {
    const weights = [0.2, 0.2, 0.3, 0.3]; // Year 1, 2, 3, 4 weights
    let fgpa = 0;

    for (let year = 1; year <= 4; year++) {
      const yearGPA = calculateYearGPA(year);
      fgpa += weights[year - 1] * yearGPA;
    }

    return fgpa.toFixed(4);
  };

  const getClassAwarded = (fgpa: number): string => {
    if (fgpa >= 3.7) return "FIRST CLASS";
    if (fgpa >= 3.3) return "SECOND CLASS (UPPER DIVISION)";
    if (fgpa >= 2.7) return "SECOND CLASS (LOWER DIVISION)";
    if (fgpa >= 2.0) return "PASS";
    return "N/A";
  };

  // Group courses by semester
  const coursesBySemester = courses.reduce((acc, course) => {
    if (!acc[course.semester]) {
      acc[course.semester] = [];
    }
    acc[course.semester].push(course);
    return acc;
  }, {} as Record<number, Course[]>);

  // Create flat list data with section headers
  const displayData: Array<
    | { type: "header"; semester: number }
    | { type: "course"; course: Course; index: number }
  > = [];
  Object.keys(coursesBySemester)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((sem) => {
      displayData.push({ type: "header", semester: sem });
      coursesBySemester[sem].forEach((course) => {
        const index = courses.indexOf(course);
        displayData.push({ type: "course", course, index });
      });
    });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>GPA Calculator</Text>

      {/* Semester Selector */}
      <Text style={styles.label}>Select Semester</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={semester}
          onValueChange={(value) => {
            setSemester(value);
            setSelectedCourse(""); // Reset course when semester changes
          }}
          style={styles.picker}
          mode="dropdown"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <Picker.Item label={`Semester ${sem}`} value={sem} key={sem} />
          ))}
        </Picker>
      </View>

      {/* Course Selector */}
      <Text style={styles.label}>Select Course</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowCourseDropdown(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedCourse || "-- Select Course --"}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#333" />
      </TouchableOpacity>

      {/* Course Selection Modal */}
      <Modal
        visible={showCourseDropdown}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowCourseDropdown(false)}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                {
                  translateY: modalSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1000, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Course</Text>
            <TouchableOpacity onPress={() => setShowCourseDropdown(false)}>
              <MaterialIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScrollView}>
            {availableCourses.map((course) => (
              <TouchableOpacity
                key={course.name}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCourse(course.name);
                  setShowCourseDropdown(false);
                }}
              >
                <Text style={styles.modalItemText}>{course.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* Credits Input (Auto-filled) */}
      <TextInput
        value={credits}
        onChangeText={setCredits}
        placeholder="Credits"
        keyboardType="numeric"
        style={styles.input}
        editable={false}
      />

      {/* Grade Selector */}
      <Text style={styles.label}>Select Grade</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={grade}
          onValueChange={setGrade}
          style={styles.picker}
          mode="dropdown"
        >
          {gradeOptions.map((option) => (
            <Picker.Item label={option} value={option} key={option} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={addCourse}
        activeOpacity={0.8}
        onPressIn={() => {
          Animated.spring(buttonScaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(buttonScaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }}
      >
        <Animated.View
          style={[
            styles.addButtonInner,
            { transform: [{ scale: buttonScaleAnim }] },
          ]}
        >
          <Text style={styles.addButtonText}>Add Course</Text>
        </Animated.View>
      </TouchableOpacity>

      <FlatList
        data={displayData}
        keyExtractor={(item, idx) => idx.toString()}
        style={{ marginTop: 18 }}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View style={styles.semesterHeader}>
                <Text style={styles.semesterHeaderText}>
                  Semester {item.semester}
                </Text>
              </View>
            );
          } else {
            return (
              <View style={styles.courseRow}>
                <View style={styles.courseInfoBox}>
                  <Text style={styles.courseText}>
                    {item.course.name}: {item.course.grade}
                  </Text>
                </View>
                <View style={styles.deleteBox}>
                  <TouchableOpacity onPress={() => removeCourse(item.index)}>
                    <MaterialIcons name="delete" size={24} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
        }}
      />
      <Text style={styles.gpa}>GPA: {calculateGPA()}</Text>
      <Text style={styles.fgpa}>FGPA: {calculateFGPA()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
    backgroundColor: "#f5f6fa",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: "#34495e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 6,
    borderRadius: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  addButton: {
    marginVertical: 12,
  },
  addButtonInner: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalScrollView: {
    flex: 1,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  courseRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  courseInfoBox: {
    flex: 1,
    backgroundColor: "#e2eafc",
    borderRadius: 4,
    padding: 10,
    justifyContent: "center",
  },
  courseText: {
    fontSize: 14,
    color: "#333",
  },
  deleteBox: {
    width: 50,
    backgroundColor: "#ffe6e6",
    borderRadius: 4,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  semesterHeader: {
    backgroundColor: "#34495e",
    padding: 10,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 4,
  },
  semesterHeaderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  gpa: {
    fontSize: 20,
    marginTop: 22,
    fontWeight: "bold",
    color: "#1abc9c",
  },
  fgpa: {
    fontSize: 20,
    marginTop: 12,
    fontWeight: "bold",
    color: "#3498db",
  },
  classAwarded: {
    fontSize: 18,
    marginTop: 12,
    fontWeight: "bold",
    color: "#e67e22",
  },
});
