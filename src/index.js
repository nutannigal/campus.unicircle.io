import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';

// Login
import { Login } from './components/Login/Login';
import { Forgotpassword } from './components/Login/Forgotpassword';
import { ResetYourPassword } from './components/Login/ResetYourPassword';
import { SecurityCode } from './components/Login/SecurityCode';
import { NewPassword } from './components/Login/NewPassword';

// dashboard
import { Homepage } from './components/Homepage';
import { CampusNews } from './components/Campus News/CampusNews';
import { CreateNews } from './components/Campus News/CreateNews';
import { NewsPreview } from './components/Campus News/NewsPreview';
import { UploadStudent } from './components/Students/UploadStudent';
import { Event } from './components/Events/Event';
import { EventPreview } from './components/Events/EventPreview';
import { Student } from './components/Students/Student';
import { AddStudent } from './components/Students/AddStudent';
import ImpStudents from './components/Students/impStudents';

import { ViewStudent } from './components/Students/ViewStudent';

import { FaqDetails } from "./components/FAQ/FaqDetails";
import { CreateFaq } from "./components/FAQ/CreateFaq";

import { StaffDetails } from './components/Staff Directory/StaffDetails';
import { AddStaff } from './components/Staff Directory/AddStaff';
import { ViewProfile } from './components/Staff Directory/ViewProfile';
import { JobDetails } from './components/Job/JobDetails';
import { CreateJob } from './components/Job/CreateJob';
import { ViewJob } from './components/Job/ViewJob';
import { JobPreview } from './components/Job/JobPreview';
import { DepartmentDetails } from './components/Department/DepartmentDetails';
import { CreateDepartment } from './components/Department/CreateDepartment';
import { MarketplaceDetails } from './components/Marketplace/MarketplaceDetails';
import { SellItem } from './components/Marketplace/SellItem';
import { MarketPlaceStep2 } from './components/Marketplace/MarketPlaceStep2';
import { ViewMarketDetails } from './components/Marketplace/ViewMarketDetails';
import { ViewItem } from './components/Marketplace/ViewItem';
import { TicketsDashboard } from './components/Tickets/TicketsDashboard';
import { Groups } from './components/Tickets/Groups';

import { Calender } from './components/Calender/Calender';
import { Community } from "./components/Community/Community";
import { CreateGroup } from "./components/Community/CreateGroup";
import { Club } from "./components/Community/Club";
import { ListOfCommunity } from "./components/Community/ListOfCommunity";
import { Invite } from './components/Community/Invite';

import { AppointmentDetails } from './components/Appointment/AppointmentDetails';
import { CreateAppoinment } from './components/Appointment/CreateAppoinment';
import { Polls } from './components/Polls/Polls';
import { CreatePoll } from './components/Polls/CreatePoll';
import { PollsFormStep2 } from './components/Polls/PollsFormStep2';
import { PollsFormStep3 } from './components/Polls/PollsFormStep3';
import { PollsFormStep4 } from './components/Polls/PollsFormStep4';

import { Exam } from './components/Exam/Exam';
import { Explore } from './components/Tickets/Explore';

import { UploadExam } from './components/Exam/UploadExam';
import { CreateEvent } from './components/Events/CreateEvent';
import { CourseDetails } from './components/Course/CourseDetails';
import { CreateCourse } from './components/Course/CreateCourse'
import { ClassDetails } from './components/Class/ClassDetails';
import { CreateClass } from './components/Class/CreateClass';
import { MapDetails } from './components/Map/MapDetails';
import { SubjectDetails } from './components/Subject/SubjectDetails';
import { CreateSubject } from './components/Subject/CreateSubject';
import { ChangePassword } from './components/ChangePassword';
import { DisplayHelp } from './components/Help&Support/DisplayHelp';
// import { NewTimeTable } from './components/Schedule/NewTimeTable'
// schedule 
import { Schedule } from './components/Schedule/Schedule';
import { AddSchedule } from './components/Schedule/AddSchedule';
// import {DisplaySchedule} from './components/Schedule/DisplaySchedule';
import { Timetable } from './components/Schedule/Timetable';

import { Profile } from '../src/components/Profile/Profile';
// import {Chat} from './components/Chat/Chat';
import { AddExam } from './components/Exam/AddExam';
import { ExamForm2 } from './components/Exam/ExamForm2';
import { ExamForm3 } from './components/Exam/ExamForm3';

// import {MapDetails} from './components/Map/MapDetails';
import { CreateMapDetails } from './components/Map/CreateMapDetails';
import Summernote from './components/Summernote';
import { ReactToaster } from './components/Toasters/ReactToaster';
import { FeedHomePage } from './components/Feed/FeedHomePage';

import { FlaggedContents } from './components/Flagged Contents/FlaggedContents.js';

// Create a basic store if you don't have one yet
import { configureStore } from '@reduxjs/toolkit';


// Create a simple store (you can expand this later)
const store = configureStore({
  reducer: {
    // Add your reducers here
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          {/* login */}
          <Route path="/" element={<Login />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/resetYourPassword" element={<ResetYourPassword />} />
          <Route path="/securityCode" element={<SecurityCode />} />
          <Route path="/newPassword" element={<NewPassword />} />

          {/* Home */}
          <Route path="/homepage" element={<Homepage />} />

          {/* Calendar */}

          {/* student */}
          <Route path="/student" element={<Student />} />
          <Route path="/addStudent" element={<AddStudent />} />
          <Route path="/impStudents" element={<ImpStudents />} />

          <Route path="/uploadFile" element={<UploadStudent />} />
          <Route path="/viewStudent" element={<ViewStudent />} />

          {/* Teacher */}
          <Route path="/uploadFileExam" element={<UploadExam />} />
          <Route path="/exam" element={<Exam />} />
          {/* Lecture */}

          {/* news */}
          <Route path="/campusNews" element={<CampusNews />} />
          <Route path="/createNews" element={<CreateNews />} />
          <Route path="/newspreview" element={<NewsPreview />} />

          {/* events */}

          {/* polls */}

          {/* community */}
          <Route path="/createGroup" element={<CreateGroup />} />
          <Route path="/club" element={<Club />} />
          <Route path="/listOfCommunity" element={<ListOfCommunity />} />
          <Route path="/invite" element={<Invite />} />

          <Route path="/event" element={<Event />} />
          <Route path="/createEvent" element={<CreateEvent />} />
          <Route path="/eventpreview" element={<EventPreview />} />


          <Route path="/faqDetails" element={<FaqDetails />} />
          <Route path="/createFaq" element={<CreateFaq />} />

          <Route path="/teachers" element={<StaffDetails />} />
          <Route path="/newTeacher" element={<AddStaff />} />
          <Route path="/viewProfile" element={<ViewProfile />} />
          <Route path="/jobDetails" element={<JobDetails />} />
          <Route path="/createJob" element={<CreateJob />} />
          <Route path="/viewJob" element={<ViewJob />} />
          <Route path="/jobpreview" element={<JobPreview />} />
          <Route path="/departmentDetails" element={<DepartmentDetails />} />
          <Route path="/createDepartment" element={<CreateDepartment />} />
          <Route path="/marketplaceDetails" element={<MarketplaceDetails />} />
          <Route path="/sellItem" element={<SellItem />} />
          <Route path="/marketplaceStep2" element={<MarketPlaceStep2 />} />
          <Route path="/viewMarketDetails" element={<ViewMarketDetails />} />
          <Route path="/viewItem" element={<ViewItem />} />

          <Route path="/ticketsDashboard" element={<TicketsDashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/community" element={<Community />} />
          <Route path="/calender" element={<Calender />} />
          <Route path="/explore" element={<Explore />} />

          <Route path="/appointmentDetails" element={<AppointmentDetails />} />
          <Route path="/createAppoinment" element={<CreateAppoinment />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/createPoll" element={<CreatePoll />} />
          <Route path="/pollsFormStep2" element={<PollsFormStep2 />} />
          <Route path="/pollsFormStep3" element={<PollsFormStep3 />} />
          <Route path="/pollsFormStep4" element={<PollsFormStep4 />} />


          <Route path="/courseDetails" element={<CourseDetails />} />
          <Route path="/createCourse" element={<CreateCourse />} />

          <Route path="/classDetails" element={<ClassDetails />} />
          <Route path="/createClass" element={<CreateClass />} />

          <Route path="/mapDetails" element={<MapDetails />} />

          <Route path="/createMapDetails" element={<CreateMapDetails />} />

          <Route path="/profile" element={<Profile />} />


          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/displayHelp" element={<DisplayHelp />} />

          <Route path="/subjectDetails" element={<SubjectDetails />} />
          <Route path="/createSubject" element={<CreateSubject />} />

          {/* schedule */}
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/createSchedule" element={<AddSchedule />} />
          {/* <Route path="/displaySchedule" element={<DisplaySchedule/>}/> */}
          <Route path="/timetable" element={<Timetable />} />
          {/* <Route path="/timetable" element={<NewTimeTable/>}/> */}

          {/* <Route path="/chat" element={<Chat/>}/> */}
          <Route path="/addExam" element={<AddExam />} />

          <Route path="/examForm2" element={<ExamForm2 />} />
          <Route path="/examForm3" element={<ExamForm3 />} />
          <Route path="/summernote" element={<Summernote />} />
          <Route path="/reacttoaster" element={<ReactToaster />} />

          {/* Feed */}
          <Route path="/feedHomePage" element={<FeedHomePage />} />
          <Route path="/FlaggedContents" element={<FlaggedContents />} />

        </Routes>
      </Router>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();