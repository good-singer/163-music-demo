{
  let view = {
    el: '#songList-container',
    template: `
      <ul class="songList">
        <li v-for="song in songs"></li>
      </ul>
    `,
    render(data) {
      let $el = $(this.el)
      $el.html(this.template)
      let { songs } = data
      let liList = songs.map(
        (song) => $('<li></li>').text(song.name).attr('data-song-id', song.id)
      )
      $el.find('ul').empty()
      liList.map((domLi) => {
        $el.find('ul').append(domLi)
      })
      // $(this.el).html(this.template)
    },
    activeItem(li) {
      let $li = $(li)
      $li.addClass('active')
        .siblings('.active').removeClass('active')
    },
    clearActive() {
      $(this.el).find('.active').removeClass('active')
    }
  }
  let model = {
    data: {
      songs: []
    },
    find() {
      let query = new AV.Query('Song')
      return query.find().then((songs) => {
        this.data.songs = songs.map((song) => {
          return { id: song.id, ...song.attributes }
        })
        return songs
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data)
      this.bindEvents()
      this.biindEventHub()
      this.getAllSongs()
    },
    getAllSongs() {
      this.model.find().then(() => {
        this.view.render(this.model.data)
      })

    },
    bindEvents() {
      $(this.view.el).on('click', 'li', (e) => {
        this.view.activeItem(e.currentTarget)
        let songId = e.currentTarget.getAttribute('data-song-id')
        window.eventHub.emit('select', { id: songId })
      })
    },
    biindEventHub() {
      window.eventHub.on('upload', () => {
        this.view.clearActive()
      })
      window.eventHub.on('create', (songData) => {

        this.model.data.songs.push(songData)
        this.view.render(this.model.data)
      })

    }
  }
  controller.init(view, model)
}