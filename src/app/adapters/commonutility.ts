import { Adapter } from './adapter';
import { User } from '../appmodels/User';
import { config } from '../appconstants/config';
import { DatePipe } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { ModalOptions } from 'ngx-bootstrap';
import { timer } from 'rxjs';

@Injectable()
export class CommonUtility {
    workinghourslist: any;
    langword: string;
    langcode: string;
    configlg: ModalOptions = {
        class: 'modal-lg', backdrop: 'static',
        keyboard: false
    };

    //   indiaTime = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss").toString();
    //   indiaTimeFormat = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd HH:mm:ss");
    configmd: ModalOptions = {
        class: 'modal-md',
        backdrop: 'static',
        keyboard: false,
        animated: true,
        ignoreBackdropClick: true,
    };
    configsmall: ModalOptions = {
        class: 'modal-sm', backdrop: 'static',
        keyboard: false
    };
    configmdwithoutanimation: ModalOptions = {
        class: 'modal-md', backdrop: 'static',
        keyboard: false
    };
    constructor(
        public datepipe: DatePipe,
    ) {

    }
    setLangCode(langLabel: string) {
        if (langLabel === config.lang_hindi_word.toString()) {
            localStorage.setItem('langCode', config.lang_code_hi);
            localStorage.setItem('langLabel', langLabel);
        } else
            if (langLabel === config.lang_telugu_word.toString()) {
                localStorage.setItem('langCode', config.lang_code_te);
                localStorage.setItem('langLabel', langLabel);
            } else {
                localStorage.setItem('langCode', config.lang_code_en);
                localStorage.setItem('langLabel', langLabel);
            }
    }

    getLangLabel(langcode: string) {

        if (langcode === config.lang_code_hi.toString()) {
            this.langword = config.lang_hindi_word.toString();
        }
        if (langcode === config.lang_code_te.toString()) {
            this.langword = config.lang_telugu_word.toString();
        }
        if (langcode === config.lang_code_en.toString()) {
            this.langword = config.lang_english_word.toString();
        }
        return this.langword;
    }

    formatPhoneNumber(phoneNumberString) {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
        var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
        if (match) {
            var intlCode = (match[1] ? '+1 ' : '')
            return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
        }
        return null
    }

    getIndianDateFormat(dt: Date) {
        var date = new Date(dt);
        var year = date.getFullYear();
        var tempmonth = date.getMonth() + 1; //getMonth is zero based;
        var tempday = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        var minute = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minute + ' ' + ampm;

        var month = tempmonth >= 10 ? tempmonth : '0' + tempmonth;
        var day = tempday >= 10 ? tempday : '0' + tempday;
        var formatted = day + '-' + month + '-' + year + ' ' + strTime;
        return formatted;
    }

    buildEndDateOfJob(totalhours: number, startdate: Date) {
        this.workinghourslist = [];
        var jobEndDate = new Date();
        var st = startdate.getTime();
        var thours = totalhours;
        this.workinghourslist.push({ "fromDate": this.getIndianDateFormat(startdate) });
        for (let i = 1; i <= thours; i++) {
            jobEndDate.setTime(st + (i * 60 * 60 * 1000));
            var hr = jobEndDate.getHours();
            if (hr == 18) {
                this.workinghourslist.push({ "toDate": this.getIndianDateFormat(jobEndDate) });
            }
            if (hr == 19) {
                var mins = jobEndDate.getMinutes();
                jobEndDate = this.setEndDate(jobEndDate, mins);
                thours = thours - i + 1;
                st = jobEndDate.getTime();
                i = 0;
            }
        }
        var endDateFinal = { "toDate": this.getIndianDateFormat(jobEndDate) };
        this.workinghourslist.push(endDateFinal);
        return this.setEndDateFormat(jobEndDate);
    }
    setEndDateFormat(jobEndDate: Date) {
        var dd = jobEndDate.getDate();
        var mm = jobEndDate.getMonth() + 1;
        var y = jobEndDate.getFullYear();
        var hr = jobEndDate.getHours();
        var min = jobEndDate.getMinutes();
        var month = mm > 10 ? mm : '0' + mm;
        var day = dd > 10 ? dd : '0' + dd;
        var mins = min > 10 ? min : '0' + min;
        var addedhourstodate = y + '-' + month + '-' + day + ' ' + hr + ':' + mins;
        return addedhourstodate;
    }
    setEndDate(st: Date, mins: number) {
        st.setDate(st.getDate() + 1);
        var dd = st.getDate();
        var mm = st.getMonth();
        var y = st.getFullYear();
        var date = new Date(y, mm, dd, 10, mins);
        var fromDate = { "fromDate": this.getIndianDateFormat(date) };
        this.workinghourslist.push(fromDate);
        return date
    }

}
