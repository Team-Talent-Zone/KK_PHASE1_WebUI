import { Adapter } from './adapter';
import { User } from '../appmodels/User';
import { config } from '../appconstants/config';
import { DatePipe } from '@angular/common';
import { Component, Injectable } from '@angular/core';
import { ModalOptions } from 'ngx-bootstrap';

@Injectable()
export class CommonUtility {

    langword: string;
    langcode: string;
    indiaTime = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "dd/MM/yyyy hh:mm:ss");
    indiaTimeFormat = this.datepipe.transform(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }), "yyyy-MM-dd HH:mm:ss");
    configlg: ModalOptions = {
        class: 'modal-lg', backdrop: 'static',
        keyboard: false
    };
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
    constructor(public datepipe: DatePipe,
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
        var hr = date.getHours();
        var tempmin = date.getMinutes();
        var month = tempmonth > 10 ? tempmonth : '0' + tempmonth;
        var day = tempday > 10 ? tempday : '0' + tempday;
        var min = tempmin > 10 ? tempmin : '0' + tempmin;
        var formatted = day + '-' + month + '-' + year + ' ' + hr + ':' + min;
        return formatted;
      }
}
