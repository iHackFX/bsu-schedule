import Group from "@/parser/source/group/group";
import Teacher from "@/parser/source/teacher/teacher";
import Location from "@/parser/source/location/location";
import Search from "@/parser/source/search/search";

import { htmlCode } from "@/class/Mooks";

const links = {
  group: ({ group, week }) => {
    return `/bsu/education/schedule/groups/show_schedule.php?group=${group}&week=${week}`;
  },
  teacher: ({ teacher, week }) => {
    return `/bsu/education/schedule/teachers/show_schedule.php?teach=${teacher}&week=${week}`;
  },
  location: ({ location, week }) => {
    return `/bsu/education/schedule/auditories/show_schedule.php?aud=${location}&week=${week}`;
  },
  loationAud: ({ location }) => {
    return `/bsu/education/schedule/auditories/index.php?auditory=${location}`;
  },
  search: ({ query }) => {
    return `/bsu/education/schedule/search/index.php?query=${query}`;
  },
};

export default class Parsers {
  htmlText = "";

  audHtmlText = ""; //! Грязно, но быстро

  constructor() {}

  async fetchGroup({ group, week, signal }) {
    if (!(group && week.length == 16)) {
      throw "Данные переданы некорректно!";
    }
    let response = await fetch(links.group({ group, week }), { signal });

    if (response.status != 200 && response.status != 304) {
      response = await fetch('https://x.serf.workers.dev'+links.group({ group, week }), { signal });
    }

    let htmlText = await response.text();
    this.htmlText = htmlText.replaceAll('<img src="../img/info.gif" class="tooltip" title="В системе ЭО «Пегас»" />', '');

    // this.htmlText = htmlCode;
    return this.parseGroup();
  }

  parseGroup() {
    if (!this.htmlText) {
      throw "Парсер имеет пустые данные для парсинга!";
    }
    try {
      let $ = new DOMParser();
      let htmlDoc = $.parseFromString(this.htmlText, "text/html");
      const tables = htmlDoc.querySelectorAll("table");
      const data = new Group({
        headerTable: tables[0],
        scheduleTable: tables[1],
      }).parsing();

      // ! Будущая проверка на корректность возвращаемых данных
      return {
        validate: true,
        type: "group",
        data,
      };
    } catch (err) {
      throw err.message;
    }
  }

  async fetchTeacher({ teacher, week, signal }) {
    if (!(teacher && week.length == 16)) {
      throw "Данные переданы некорректно!";
    }

    let response = await fetch(links.teacher({ teacher, week }), { signal });

    if (response.status != 200 && response.status != 304) {
      response = await fetch('https://x.serf.workers.dev'+links.teacher({ teacher, week }), { signal });
    }

    let htmlText = await response.text();
    this.htmlText = htmlText.replaceAll('<img src="../img/info.gif" class="tooltip" title="В системе ЭО «Пегас»" />', '');

    return this.parseTeacher();
  }

  parseTeacher() {
    if (!this.htmlText) {
      throw "Парсер имеет пустые данные для парсинга!";
    }
    try {
      let $ = new DOMParser();
      let htmlDoc = $.parseFromString(this.htmlText, "text/html");
      const tables = htmlDoc.querySelectorAll("table");
      const data = new Teacher({
        headerTable: tables[0],
        scheduleTable: tables[1],
      }).parsing();

      return {
        validate: data.header.fullName && data.header.post ? true : false,
        type: "teacher",
        data,
      };
    } catch (err) {
      throw err.message;
    }
  }

  async fetchLocation({ location, week, signal }) {
    if (!(location && week.length == 16)) {
      throw "Данные переданы некорректно!";
    }
    let response = await fetch(links.location({ location, week }), { signal });

    if (response.status != 200 && response.status != 304) {
      response = await fetch('https://x.serf.workers.dev'+links.location({ location, week }), { signal });
    }

    let htmlText = await response.text();
    this.htmlText = htmlText.replaceAll('<img src="../img/info.gif" class="tooltip" title="В системе ЭО «Пегас»" />', '');

    //! Грязно, но быстро
    response = await fetch(links.loationAud({ location }));

    if (response.status != 200 && response.status != 304) {
      response = await fetch('https://x.serf.workers.dev'+links.loationAud({ location }), { signal });
    }

    htmlText = await response.text();
    this.audHtmlText = htmlText;

    return this.parseLocation();
  }

  parseLocation() {
    if (!this.htmlText) {
      throw "Парсер имеет пустые данные для парсинга!";
    }
    try {
      let $ = new DOMParser();
      let htmlDoc = $.parseFromString(this.htmlText, "text/html");
      const tables = htmlDoc.querySelectorAll("table");
      const location = new Location({
        headerTable: tables[0],
        scheduleTable: tables[1],
      });
      const data = location.parsing();

      const check = data.header.includes(" ");

      // data.header += location.parsingAud(this.audHtmlText);
      data.header = {
        name: data.header,
        corp: location.parsingAud(this.audHtmlText),
      };

      return {
        validate: check,
        type: "teacher",
        data,
      };
    } catch (err) {
      throw err.message;
    }
  }

  async fetchSearch({ query, signal }) {
    if (!query) {
      throw "Данные переданы некорректно!";
    }

    let response = await fetch(links.search({ query }), { signal });

    if (response.status != 200 && response.status != 304) {
      response = await fetch('https://x.serf.workers.dev'+links.search({ query }), { signal });
    }

    let htmlText = await response.text();
    this.htmlText = htmlText;
    return this.parseSearch();
  }

  parseSearch() {
    if (!this.htmlText) {
      throw "Парсер имеет пустые данные для парсинга!";
    }
    try {
      let $ = new DOMParser();
      let htmlDoc = $.parseFromString(this.htmlText, "text/html");
      const tables = htmlDoc.querySelectorAll(".typo-page");
      const data = new Search(tables).parsing();

      let ids = [];
      return data.filter((el) => {
        // if (ids.indexOf(el.content.id) != -1 || el.content.post == "н/о")
        if (ids.indexOf(el.content.id) != -1) return false;

        ids.push(el.content.id);
        return true;
      });
    } catch (err) {
      throw err.message;
    }
  }
}
