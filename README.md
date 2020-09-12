# what it do
This automagically generates branch names from your jira ticket names.

# how to use

## set up RSS
Start by creating a search in Jira. We'll use this to populate our list of branch names. For example, the query i use is:

```
project = "XM" AND assignee = currentUser() AND resolution = Unresolved AND status in ("In Development", "Selected for Development", Testing) ORDER BY priority DESC
```

Then, select Export > Export Rss. You'll be redirected to a 

## getting an api token
https://confluence.atlassian.com/cloud/api-tokens-938839638.html

## generating a profile
create a yaml file called 'profiles.yaml'. It should contain an array of dictionaries, with the keys {title, token, username, url}. Token is your api token; username is your Atlassian username; url is the url of RSS file; and title is a title for this profile.

# how i use this program
i have a little script in the directory of the repo we use at my workplace. it `pushd`s into this folder, runs itself, then `popd`s back.

# FAQs

* why would you make something so complicated to solve such a simple problem?

I want descriptive branch names. I started by copy-pasting branch names and manually reformatting them, which was a bore. Next was automatically reformatting them. Finally, i got rid of the kopipe. The progression was really quite natural.
