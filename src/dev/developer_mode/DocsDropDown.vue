<template>
  <div class="dropdown is-hoverable">
    <div class="dropdown-trigger">
      | &nbsp; Docs:
      <a alt="Skip sections">
        <i-fa6-solid-book />
      </a>
    </div>
    <div class="dropdown-menu pt-25" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a href="https://smile.gureckislab.org" class="dropdown-item" target="_new">
          <i-fa6-solid-globe /> Smile Docs
        </a>

        <a href="https://github.com/NYUCCL/smile" class="dropdown-item" target="_new">
          <i-fa6-solid-globe /> Smile GitHub
        </a>
        <a href="https://github.com/NYUCCL/smile/issues" class="dropdown-item" target="_new">
          <i-fa6-solid-globe /> Smile GitHub Issues
        </a>
        <hr class="dropdown-divider" />
        <a href="https://vuejs.org" class="dropdown-item" target="_new"> <FAIcon icon="fa-solid fa-globe" /> Vuejs </a>
        <a href="https://sfc.vuejs.org" class="dropdown-item" target="_new">
          <i-fa6-solid-globe /> Vuejs SFC Playground
        </a>
        <a href="https://devtools.vuejs.org/" class="dropdown-item" target="_new">
          <i-fa6-solid-globe /> Vue Dev Tools (Chrome)
        </a>
        <hr class="dropdown-divider" />
        <a href="https://bulma.io" class="dropdown-item" target="_new"> <FAIcon icon="fa-solid fa-globe" /> Bulma </a>
        <a href="https://fontawesome.com" class="dropdown-item" target="_new"> <i-fa6-solid-globe /> FontAwesome </a>
        <hr class="dropdown-divider" />
        <a href="https://www.internetingishard.com" class="dropdown-item" target="_new">
          <i-fa6-solid-globe /> Interneting is hard
        </a>
        <a href="https://javascript.info" class="dropdown-item" target="_new">
          <i-fa6-solid-globe /> The Modern Javascript Tutorial
        </a>
      </div>
    </div>
  </div>
</template>
<style scoped>
a {
  color: #333;
}

.dropdown-content {
  border-radius: 0;
  padding-top: 0;
  padding-bottom: 0;
  color: #000;
}

.dropdown-content b {
  color: #000;
  font-size: 13px;
  margin-top: 0px;
}

.dropdown-divider {
  margin: 0;
}

.dropdown-item {
  color: #000;
  font-size: 13px;
  padding: 8px;
  margin: 0px;
  text-align: left;
}
</style>
