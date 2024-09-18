# 👥 Add a collaborator
These instructions are to facilitiate adding a collaborator to a single smile project, without giving them broad permissions to all projects in the lab.
At a high level, what you will do is take ownership of the secret files for your project only, then add the collaborator to the list of people authorized to decrypt the secret files (as opposed to giving them access to decrypt the secret files in projects across your organization).
To do so, please follow the following steps:

We start by following some of the instructions [encrypt configuration files](https://smile.gureckislab.org/labconfig.html#encrypt-your-configuration-files) as part of setting  up a smile repository:

1. Back up the existing `.gitsecret` folder: `mv .gitsecret .gitsecret-backup`
2. Initialize a new git secret folder: `git secret init`
    * If this step fails because `git-secret` is not installed, install it, using `brew install git-secret` on OSX or the equivalent Linux command.
3. You probably already have a gpg key (which you can verify by running `gpg -k`). If you don't, create a secret key by running `gpg --gen-key`.
4. Add yourself as an authorized user. Using the same email address you used when creating the secret key, run `git secret tell you@email.com`, replacing `you@email.com` with the email address you used to create the private key.
5. Add the relevant files that we want to keep secret:
```
git secret add env/.env.deploy.local
git secret add env/.env.local
git secret add env/.env.docs.local
```
6. Encrypt the changes by running `git secret hide`
7. Commit and push the changes. 

Next, we follow some of the workflow for [adding a new user](https://smile.gureckislab.org/labconfig.html#adding-additional-users-to-your-system), who will now only be added to the repository you performed the above steps for (and not for every smile repository in your lab):

8. Have your collaborator create a gpg key by running `gpg --gen-key` on their computer.
9. Have them send you the public key by running `gpg --armor --export collaborator@email.com > pbcopy` (on OSX), replacing `collaborator@email.com` with the email address they used when to create the private key.
10. Have them send you the file `pbcopy`
11. Import their public key into your keychain by running the command `pbpaste | gpg --import`
12. Add their key to the ones authorized to decrypt the secret by running `git secret tell collaborator@email.com` (again replacing `collaborator@email.com` with their email address).
13. Re-encrypt the files by running `git secret reveal; git secret hide`
14. Commit and push these changes.

At this point, your collaborator should be start to work, and they can follow a subset of the instructions for [starting a new project](https://smile.gureckislab.org/starting.html#_2-configure-your-project):

15. Git clone the repository your added them to.
16. Decrypt the secret files by running `git secret reveal`
17. Set up the project for development by running `npm run setup_project`.
18. Start developing by running `npm run dev`.

## Adding future collaborators
Once you follow these steps once, you don't need to run steps 1-7 again. 
To add a second or third collaborator, start them from the instructions in step 8, and proceed from there.




 
