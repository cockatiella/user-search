var app = new Vue({
    el: "#app",
    data: function () {
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
        filteredUsers: function () {
            var _this = this;
            var filtered = this.users;
            if (this.search) {
                filtered = filtered.filter(function (user) {
                    var fullName = "".concat(user.name.first, " ").concat(user.name.last).toLowerCase();
                    return fullName.includes(_this.search.toLowerCase());
                });
            }
            if (this.filterGender) {
                filtered = filtered.filter(function (user) { return user.gender === _this.filterGender; });
            }
            return filtered;
        },
    },
    methods: {
        capitalizeFirstLetter: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        fetchInitialResults: function () {
            var _this = this;
            axios
                .get("https://randomuser.me/api/?results=".concat(this.resultsPerPage))
                .then(function (response) {
                _this.users = response.data.results;
                _this.displayedUsers = _this.users.slice(0, _this.resultsPerPage);
                _this.hasMoreResults = _this.displayedUsers.length < _this.filteredUsers.length;
            })
                .catch(function (error) {
                console.error(error);
            });
        },
        filterUsers: function () {
            this.displayedUsers = this.filteredUsers.slice(0, this.resultsPerPage);
            this.currentPage = 1;
            localStorage.setItem("search", this.search);
            localStorage.setItem("filterGender", this.filterGender);
            this.hasMoreResults = this.displayedUsers.length < this.filteredUsers.length;
        },
        loadMoreResults: function () {
            var _this = this;
            var startIndex = this.displayedUsers.length;
            var endIndex = startIndex + this.resultsPerPage;
            this.isLoadingMore = true;
            axios
                .get("https://randomuser.me/api/?results=".concat(this.resultsPerPage))
                .then(function (response) {
                var newUsers = response.data.results;
                _this.displayedUsers = _this.displayedUsers.concat(newUsers);
                _this.isLoadingMore = false;
                _this.hasMoreResults = _this.displayedUsers.length < _this.filteredUsers.length;
            })
                .catch(function (error) {
                console.error(error);
                _this.isLoadingMore = false;
            });
        },
        showUserDetails: function (user) {
            this.selectedUser = user;
        },
        handleScroll: function () {
            var scrollTop = window.pageYOffset ||
                document.documentElement.scrollTop ||
                document.body.scrollTop;
            var windowHeight = window.innerHeight ||
                document.documentElement.clientHeight ||
                document.body.clientHeight;
            var documentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            if (documentHeight - scrollTop - windowHeight <= this.scrollThreshold &&
                this.hasMoreResults) {
                this.loadMoreResults();
            }
        },
    },
    mounted: function () {
        this.fetchInitialResults();
        window.addEventListener("scroll", this.handleScroll);
        this.selectedUser = JSON.parse(localStorage.getItem("selectedUser") || "null");
    },
    beforeDestroy: function () {
        window.removeEventListener("scroll", this.handleScroll);
        localStorage.setItem("selectedUser", JSON.stringify(this.selectedUser));
    },
    destroyed: function () {
        this.selectedUser = null;
    },
});
