import { Injectable } from '@nestjs/common';
import axios from 'axios';
import cheerio from 'cheerio';

@Injectable()
export class AppService {

  private url = 'https://onlineradiobox.com';
  public radioStations = [];

  async getData(country) {
    console.log(country);
    const { data } = await axios.get(this.url + `/${country}`);
    const $ = cheerio.load(data);
    const stationsList = $('.stations-list .stations__station');
    stationsList.each((i, el) => {
      const station = {
        id: null,
        title: '',
        url: this.url,
        imgUrl: 'https:',
        website: '',
        tags: [],
        country: ''
      };
      station.id = $(el).attr('radioid');
      const radioLink = $(el).children('figure').children('a');
      station.title = radioLink.children('.station__title__name').text();
      station.url += radioLink.attr('href');
      station.imgUrl += radioLink.children('.station__title__logo').attr('src');
      this.promise(station)
    });
  }

  async promise(station) {
    const list = [];
    const promise = new Promise((resolve): any => {
      this.getRadioStation(station.url).then((response) => {
        resolve(response)
      })
    }).then((response) => {
      Object.entries(response).forEach(entry => {
        const [key, value] = entry;
        if (key === 'website') station.website = value;
        else if (key === 'country') station.country = value;
        else value.forEach(tag => station.tags.push(tag));
      });
      list.push(station);
      return list;
    })
    promise.then(res => {
      console.log(res);
    })
  }

  async getRadioStation(url): Promise<object> {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const radioStationData = $('.station');
    const radioStation = {
      country: '',
      website: null,
      tags: []
    };
    radioStation.country = $('.breadcrumbs li a span:first').text();
    radioStationData.each((i, el) => {
      radioStation.website = $(el).find('.station__reference--web').attr('href');
      $(el).find('.station__tags li').each((tagId, tagEl) => {
        radioStation.tags.push($(tagEl).children('.ajax').text());
      })
    });
    return radioStation;
  }
}
