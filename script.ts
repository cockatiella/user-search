interface User {
  login: {
    uuid: string;
  };
  name: {
    first: string;
    last: string;
  };
  picture: {
    thumbnail: string;
    large: string;
  };
  email: string;
  gender: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  phone: string;
  cell: string;
}

interface AppData {
  search: string;
  users: User[];
  displayedUsers: User[];
  currentPage: number;
  resultsPerPage: number;
  scrollThreshold: number;
  isLoadingMore: boolean;
  filterGender: string;
  selectedUser: User | null;
  hasMoreResults: boolean;
}

const app = new Vue({
  el: "#app",
  data(): AppData {
    return {
      search: localStorage.getItem("search") || "",
      users: [],
      displayedUsers: [],
      currentPage: parseInt(localStorage.getItem("currentPage")) || 1,
      resultsPerPage: 25,
      scrollThreshold: 200,
      isLoadingMore: false,
      filterGender: localStorage.getItem("filterGender") || "",
      selectedUser: null,
      hasMoreResults: false,
    };
  },
  computed: {
    filteredUsers(): User[] {
      let filtered = this.users;
      if (this.search) {
        filtered = filtered.filter((user: { name: { first: any; last: any; }; }) => {
          const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
          return fullName.includes(this.search.toLowerCase());
        });
      }
      if (this.filterGender) {
        filtered = filtered.filter((user: { gender: any; }) => user.gender === this.filterGender);
      }
      return filtered;
    },
  },
  methods: {
    capitalizeFirstLetter(string: string): string {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    fetchInitialResults(): void {
      axios
        .get(`https://randomuser.me/api/?results=${this.resultsPerPage}`)
        .then((response: { data: { results: any; }; }) => {
          this.users = response.data.results;
          this.displayedUsers = this.users.slice(0, this.resultsPerPage);
          this.hasMoreResults = this.displayedUsers.length < this.filteredUsers.length;
        })
        .catch((error: any) => {
          console.error(error);
        });
    },
    filterUsers(): void {
      this.displayedUsers = this.filteredUsers.slice(0, this.resultsPerPage);
      this.currentPage = 1;
      localStorage.setItem("search", this.search);
      localStorage.setItem("filterGender", this.filterGender);
      this.hasMoreResults = this.displayedUsers.length < this.filteredUsers.length;
    },
    loadMoreResults(): void {
      const startIndex = this.displayedUsers.length;
      const endIndex = startIndex + this.resultsPerPage;

      this.isLoadingMore = true;

      axios
        .get(`https://randomuser.me/api/?results=${this.resultsPerPage}`)
        .then((response: { data: { results: any; }; }) => {
          const newUsers = response.data.results;
          this.displayedUsers = this.displayedUsers.concat(newUsers);
          this.isLoadingMore = false;
          this.hasMoreResults = this.displayedUsers.length < this.filteredUsers.length;
        })
        .catch((error: any) => {
          console.error(error);
          this.isLoadingMore = false;
        });
    },

    showUserDetails(user: User): void {
      this.selectedUser = user;
    },
    handleScroll(): void {
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      const windowHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      const documentHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;

      if (
        documentHeight - scrollTop - windowHeight <= this.scrollThreshold &&
        this.hasMoreResults
      ) {
        this.loadMoreResults();
      }
    },
  },
  mounted(): void {
    this.fetchInitialResults();

    window.addEventListener("scroll", this.handleScroll);

    this.selectedUser = JSON.parse(
      localStorage.getItem("selectedUser") || "null"
    );
  },
  beforeDestroy(): void {
    window.removeEventListener("scroll", this.handleScroll);

    localStorage.setItem("selectedUser", JSON.stringify(this.selectedUser));
  },
  destroyed(): void {
    this.selectedUser = null;
  },
});