import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { RadioStation } from './radio-station.entity';
import axios from 'axios';
import cheerio from 'cheerio';
import { CreateRadioStationDto } from './dto/create-radio-station.dto';

@Injectable()
export class RadioStationService {
  private url = 'https://onlineradiobox.com';

  constructor(
    @InjectRepository(RadioStation)
    private readonly radioStationRepository: Repository<RadioStation>,
  ) {}

  async getByRadioId(radioId: number): Promise<RadioStation> {
    return this.radioStationRepository.findOneBy({ radioId });
  }

  async getByTags(tags: string): Promise<RadioStation[]> {
    const splitTags = tags.split(',');
    let parsedTags = '';
    splitTags.forEach((splitTag, index) => {
      if (index !== 0) parsedTags += ',';
      parsedTags += `"${splitTag}"`;
    });
    console.log(parsedTags);
    return this.radioStationRepository.findBy({
      tags: Like(`%${tags}%`),
    });
  }

  async create(country: string) {
    const axiosResponse = await axios.get(this.url + `/${country}`);
    console.log(axiosResponse);
    const $ = cheerio.load(axiosResponse.data);
    const stationsList = $('.stations-list .stations__station');
    stationsList.each((i, el) => {
      const station = {
        id: null,
        title: '',
        url: this.url,
        imgUrl: 'https:',
        website: '',
        tags: [],
        country: '',
      };
      station.id = $(el).attr('radioid');
      const radioLink = $(el).children('figure').children('a');
      station.title = radioLink.children('.station__title__name').text();
      station.url += radioLink.attr('href');
      station.imgUrl += radioLink.children('.station__title__logo').attr('src');
      this.response(station).then((res) => {
        const radioStation = new RadioStation();
        radioStation.radioId = res.id;
        radioStation.title = res.title;
        radioStation.url = res.url;
        radioStation.imgUrl = res.imgUrl;
        radioStation.website = res.website;
        radioStation.tags = res.tags;
        radioStation.country = res.country;
        console.log(radioStation);
        this.radioStationRepository.save(radioStation);
      });
    });
  }

  async response(radioStation: any) {
    return new Promise((resolve): any => {
      this.parseRadioStation(radioStation.url).then((response) => {
        resolve(response);
      });
    }).then((response) => {
      Object.entries(response).forEach((entry) => {
        const [key, value] = entry;
        if (key === 'website') radioStation.website = value;
        else if (key === 'country') radioStation.country = value;
        else value.forEach((tag) => radioStation.tags.push(tag));
      });
      return radioStation;
    });
  }

  async parseRadioStation(url: string): Promise<object> {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const radioStationData = $('.station');
    const radioStation = {
      country: '',
      website: null,
      tags: [],
    };
    radioStation.country = $('.breadcrumbs li a span:first').text();
    radioStationData.each((i, el) => {
      radioStation.website = $(el)
        .find('.station__reference--web')
        .attr('href');
      $(el)
        .find('.station__tags li')
        .each((tagId, tagEl) => {
          radioStation.tags.push($(tagEl).children('.ajax').text());
        });
    });
    return radioStation;
  }
}
