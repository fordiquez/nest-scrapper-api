import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scrape } from './scrape.entity';
import axios from "axios";
import cheerio from "cheerio";

@Injectable()
export class ScrapeService {
  private url = 'https://onlineradiobox.com';

  constructor(@InjectRepository(Scrape) private readonly scrapeRepository: Repository<Scrape>) {}

  async create(country) {
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
      this.response(station).then(res => {
        const scrape = new Scrape();
        scrape.radioId = res.id;
        scrape.title = res.title;
        scrape.url = res.url;
        scrape.imgUrl = res.imgUrl;
        scrape.website = res.website;
        scrape.tags = JSON.stringify(res.tags);
        scrape.country = res.country;
        console.log(scrape);
        this.scrapeRepository.save(scrape);
      })
    })
  }

  async response(radioStation) {
    return new Promise((resolve): any => {
      this.parseRadioStation(radioStation.url).then((response) => {
        resolve(response)
      })
    }).then((response) => {
      Object.entries(response).forEach(entry => {
        const [key, value] = entry;
        if (key === 'website') radioStation.website = value;
        else if (key === 'country') radioStation.country = value;
        else value.forEach(tag => radioStation.tags.push(tag));
      });
      return radioStation
    })
  }

  async parseRadioStation(url): Promise<object> {
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
