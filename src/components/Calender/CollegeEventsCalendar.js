import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import $ from "jquery";
import moment from "moment";
import { format } from "date-fns";
import { Calendar } from "react-calendar";
import flow from "lodash/fp/flow";
import filter from "lodash/fp/filter";
import sortBy from "lodash/fp/sortBy";
import last from "lodash/fp/last";
import { memoize } from "lodash";
import { START_DATE, END_DATE } from "react-dates/constants";

const Wrapper = styled.div``;
const DETAILS = styled.div``;
const Number = styled.div``;
const Event = styled.div``;
const EventStart = styled(Event)``;
const EventSpan = styled(Event)``;
const EventEnd = styled(Event)``;

var array = [];

export function CollegeEventsCalendar() {
  const token = localStorage.getItem("Token");

  // ✅ Define month-related constants FIRST
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const d = new Date();
  const currentMonth = d.getMonth() + 1;
  const currMonth = monthNames[d.getMonth()];

  
  //   console.log("✅ Debug - currentMonth:1", typeof currentMonth);
  // console.log("✅ Debug - currMonth:1", typeof currMonth);

  // ✅ Now safe to use in state
  const [currYear, setCurrYear] = useState(d.getFullYear());
  const [todaysDate, setTodaysDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [numberOfEvents, updateEvents] = useState("");
  const [eventDate, updateEventDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [month, updateMonth] = useState(currMonth);
  const [selectedDate, setSelectedDate] = useState("");
  const [onlyDate, setOnlyDate] = useState("");
  const [markData, setMarkData] = useState([]);


  //   console.log("✅ Debug - currentMonth:", typeof currentMonth);
  // console.log("✅ Debug - currMonth:", typeof currMonth);


  const mark = markData;

  const Date_Click_Fun = (date) => {
    setSelectedDate(date);
    const onlyD = format(date, "dd MMM");
    setOnlyDate(onlyD);
    const dd = format(date, "yyyy-MM-dd");
    showDate(dd);
  };

  async function fetchList() {
    try {
      const fetchResponse = await axios.get(
        process.env.REACT_APP_API_KEY + "admin_get_event_date",
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      const events = fetchResponse.data.data;
      if (fetchResponse.data.error_code === 200) {
        updateEvents(events.length);
        array = [events]; // ✅ reset before push
        setMarkData(events);
      }
    } catch (err) {
      console.log("Error fetching event list:", err);
    }
  }

  useEffect(() => {
    fetchList();
  }, []);

  const isBetween = (date, start, end) => {
    return moment(date).isBetween(start, end, null, "[]");
  };

  const isDayHighlighted = (day) => {
    for (const item of array) {
      for (const { start_date, end_date } of item) {
        if (isBetween(day, start_date, end_date)) {
          return true;
        }
      }
    }
    return false;
  };

  const getEventForDay = memoize((day) =>
    flow(
      filter(({ start, end }) => day.isBetween(start, end, "day", "[]")),
      sortBy("start"),
      last
    )(array)
  );

  const renderEventForDay = (day) => {
    const event = getEventForDay(day);
    if (!event) return null;
    const { start, end, label, type } = event;
    const isBooking = type === "booking";
    const isStart = day.isSame(start, "day");
    const isEnd = day.isSame(end, "day");

    if (isStart && isEnd) return <Event green={isBooking}>{label}</Event>;
    if (isStart) return <EventStart green={isBooking}>{label}</EventStart>;
    if (isEnd) return <EventEnd green={isBooking} />;
    return <EventSpan green={isBooking}>{label}</EventSpan>;
  };

  async function showDate(day) {
    try {
      const formDataCategory = new FormData();
      formDataCategory.append("date", day);
      const responseDate = await axios.post(
        process.env.REACT_APP_API_KEY + "admin_get_datewise_event_list_l_d",
        formDataCategory,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );
      if (responseDate.data.error_code === 200) {
        setData(responseDate.data.data);
        $(".show_events").show();
      }
    } catch (err) {
      console.log("Error fetching datewise events:", err);
    }
  }

  $(".close_event").click(function () {
    $(".show_events").hide();
  });

  return (
    <div style={{ height: "100%" }}>
      <div
        className="d-flex align-items-center"
        style={{
          flexWrap: "wrap",
          background: "#6C7A99",
          color: "white",
          lineHeight: "43px",
        }}
      >
        <div
          style={{
            fontWeight: "500",
            marginLeft: "20px",
            fontSize: "10px",
          }}
        >
          Event Calendar
        </div>
      </div>

      <Wrapper>
        <Calendar
          value={selectedDate}
          onClickDay={Date_Click_Fun}
          tileClassName={({ date }) => {
            if (mark.find((x) => x === moment(date).format("YYYY-MM-DD"))) {
              return "highlight";
            }
            if (
              moment(todaysDate).format("YYYY-MM-DD") ===
              moment(date).format("YYYY-MM-DD")
            ) {
              return "current_date";
            }
          }}
        />
      </Wrapper>
    </div>
  );
}
